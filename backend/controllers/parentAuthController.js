const parentModel = require('../model/parent');
const ParentOtp = require('../model/parentOtp');
const SessionLog = require('../model/sessionLog');
const AttendStudent = require('../model/attendStudent');
const Attendance = require('../model/attendance');
const { hashPassword, verifyPassword } = require('../utils/authUtils');
const { generateOtp, sendOtpSms, normalizePhoneForSms } = require('../utils/otpUtils');

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{7,15}$/;
const normalizeIdentifier = (rawIdentifier = '') => {
    const value = String(rawIdentifier || '').trim();
    if (!value) return { type: 'unknown', value: '' };

    const email = value.toLowerCase();
    if (EMAIL_REGEX.test(email)) {
        return { type: 'email', value: email };
    }

    const phone = value.replace(/\D/g, '');
    if (PHONE_REGEX.test(phone)) {
        return { type: 'phone', value: phone };
    }

    return { type: 'unknown', value };
};

const generateParentEmailFromPhone = async (phone) => {
    const base = `parent_${phone}`;
    let suffix = 0;

    while (true) {
        const candidate = `${base}${suffix ? `_${suffix}` : ''}@zono.local`;
        const exists = await parentModel.findOne({ email: candidate }).lean();
        if (!exists) {
            return candidate;
        }
        suffix += 1;
    }
};

const findParentByIdentifier = async ({ type, value }) => {
    if (type === 'email') {
        return parentModel.findOne({ email: value });
    }
    if (type === 'phone') {
        return parentModel.findOne({ phone: value });
    }
    return null;
};

const ensureParentFromLinkedStudent = async ({ type, value }) => {
    const linkedStudent = await AttendStudent.findOne({ parentContact: value }).select('name').lean();
    if (!linkedStudent) {
        return null;
    }

    const placeholderPassword = await hashPassword(`otp-only-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

    if (type === 'email') {
        return parentModel.create({
            name: `Parent of ${linkedStudent.name || 'Student'}`,
            email: value,
            phone: '',
            password: placeholderPassword,
        });
    }

    if (type === 'phone') {
        // Phone-only auto-provisioning is disabled when OTP is delivery-only.
        return null;
    }

    return null;
};

const dayKey = (value) => new Date(value).toISOString().split('T')[0];

const toMonthRange = (monthInput) => {
    const normalized = String(monthInput || '').trim();
    const base = /^\d{4}-\d{2}$/.test(normalized)
        ? `${normalized}-01T00:00:00.000Z`
        : new Date(new Date().toISOString().slice(0, 7) + '-01T00:00:00.000Z').toISOString();

    const start = new Date(base);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    const month = start.toISOString().slice(0, 7);

    return { start, end, month };
};

exports.requestParentOtp = async (req, res) => {
    try {
        const rawIdentifier = String(req.body?.identifier || req.body?.email || req.body?.phone || '').trim();

        if (!rawIdentifier) {
            return res.status(400).json({ message: 'Mobile number is required' });
        }

        const identifier = normalizeIdentifier(rawIdentifier);
        if (identifier.type !== 'phone') {
            return res.status(400).json({ message: 'Please enter a valid mobile number' });
        }

        let parent = await findParentByIdentifier(identifier);

        if (!parent) {
            parent = await ensureParentFromLinkedStudent(identifier);
        }

        if (!parent) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        const phoneNumber = normalizePhoneForSms(parent.phone || (identifier.type === 'phone' ? identifier.value : ''));
        if (!phoneNumber) {
            return res.status(400).json({
                message: 'Parent mobile number is not configured. Please update parent contact number in Parent Link section.',
            });
        }

        const otpKey = `phone:${phoneNumber}`;

        const otp = generateOtp();
        const otpHash = await hashPassword(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await ParentOtp.deleteMany({ email: otpKey });
        await ParentOtp.create({
            email: otpKey,
            otpHash,
            expiresAt,
            attempts: 0,
        });

        const smsResult = await sendOtpSms({ to: phoneNumber, otp, appName: 'Zono' });
        const isDevelopment = process.env.NODE_ENV !== 'production';

        if (!smsResult.sent) {
            if (isDevelopment) {
                return res.status(200).json({
                    message: 'SMS provider not configured. Development fallback OTP generated.',
                    otpExpiresInSeconds: OTP_EXPIRY_MS / 1000,
                    target: phoneNumber,
                    devOtp: otp,
                    deliveryFallback: true,
                    reason: smsResult.reason || 'sms_delivery_failed',
                });
            }

            return res.status(500).json({
                message: 'Failed to send OTP SMS. Please verify SMS provider configuration.',
                reason: smsResult.reason || 'sms_delivery_failed',
            });
        }

        return res.status(200).json({
            message: 'OTP sent to your mobile number successfully',
            otpExpiresInSeconds: OTP_EXPIRY_MS / 1000,
            target: phoneNumber,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};

exports.verifyParentOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const rawIdentifier = String(req.body?.identifier || req.body?.email || req.body?.phone || '').trim();

        if (!rawIdentifier || !otp) {
            return res.status(400).json({ message: 'Mobile number and OTP are required' });
        }

        const identifier = normalizeIdentifier(rawIdentifier);
        if (identifier.type !== 'phone') {
            return res.status(400).json({ message: 'Please enter a valid mobile number' });
        }

        const parent = await findParentByIdentifier(identifier);

        if (!parent) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        const phoneNumber = normalizePhoneForSms(parent.phone || (identifier.type === 'phone' ? identifier.value : ''));
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Parent mobile number is not configured. Please contact support.' });
        }

        const otpKey = `phone:${phoneNumber}`;

        const otpRecord = await ParentOtp.findOne({ email: otpKey }).sort({ createdAt: -1 });
        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
        }

        if (new Date() > otpRecord.expiresAt) {
            await ParentOtp.deleteMany({ email: otpKey });
            return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
        }

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            await ParentOtp.deleteMany({ email: otpKey });
            return res.status(429).json({ message: 'Too many invalid attempts. Please request a new OTP.' });
        }

        const isValidOtp = await verifyPassword(String(otp), otpRecord.otpHash);

        if (!isValidOtp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        await ParentOtp.deleteMany({ email: otpKey });

        req.session.user = {
            id: String(parent._id),
            email: parent.email,
            role: 'parent',
            name: parent.name || parent.email,
            loginAt: new Date().toISOString(),
        };

        await SessionLog.create({
            sessionId: req.sessionID,
            userId: parent._id,
            email: parent.email,
            role: 'parent',
            event: 'login',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
        });

        return res.status(200).json({ message: 'Success', user: req.session.user });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
    }
};

exports.getParentAttendanceCalendar = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'parent') {
            return res.status(403).json({ message: 'Parent access required' });
        }

        const parent = await parentModel.findById(req.session.user.id).select('email phone').lean();
        if (!parent) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        const { start, end, month } = toMonthRange(req.query?.month);

        const parentContactOptions = [String(parent.email || '').trim(), String(parent.phone || '').trim()].filter(Boolean);

        if (!parentContactOptions.length) {
            return res.json({
                month,
                students: [],
                selectedStudentId: '',
                calendar: [],
            });
        }

        const children = await AttendStudent.find({ parentContact: { $in: parentContactOptions } })
            .select('name roll year department parentContact')
            .sort({ roll: 1 })
            .lean();

        if (!children.length) {
            return res.json({
                month,
                students: [],
                selectedStudentId: '',
                calendar: [],
            });
        }

        const requestedStudentId = String(req.query?.studentId || '').trim();
        const selectedStudent = requestedStudentId
            ? children.find((student) => String(student._id) === requestedStudentId)
            : children[0];

        if (!selectedStudent) {
            return res.status(403).json({ message: 'Invalid student selection for this parent account' });
        }

        const cohortAttendance = await Attendance.find({
            department: selectedStudent.department,
            year: selectedStudent.year,
            markedAt: { $gte: start, $lt: end },
        })
            .select('studentId classNumber teacherId markedAt')
            .lean();

        const selectedStudentId = String(selectedStudent._id);
        const totalByDay = new Map();
        const attendedByDay = new Map();

        for (const entry of cohortAttendance) {
            const date = dayKey(entry.markedAt);
            const sessionKey = `${entry.classNumber || ''}|${entry.teacherId || ''}|${new Date(entry.markedAt).getUTCHours()}`;

            if (!totalByDay.has(date)) {
                totalByDay.set(date, new Set());
            }
            totalByDay.get(date).add(sessionKey);

            if (String(entry.studentId) === selectedStudentId) {
                if (!attendedByDay.has(date)) {
                    attendedByDay.set(date, new Set());
                }
                attendedByDay.get(date).add(sessionKey);
            }
        }

        const calendar = [];
        for (const [date, totalSet] of totalByDay.entries()) {
            const attendedSet = attendedByDay.get(date) || new Set();
            const totalLectures = totalSet.size;
            const attendedLectures = attendedSet.size;
            const percentage = totalLectures > 0 ? Math.round((attendedLectures / totalLectures) * 100) : 0;

            let status = 'red';
            if (percentage === 100) {
                status = 'green';
            } else if (percentage >= 51) {
                status = 'yellow';
            } else if (percentage > 0 && percentage <= 50) {
                status = 'orange';
            } else {
                status = 'red';
            }

            calendar.push({
                date,
                totalLectures,
                attendedLectures,
                percentage,
                status,
            });
        }

        calendar.sort((a, b) => a.date.localeCompare(b.date));

        return res.json({
            month,
            students: children.map((student) => ({
                id: String(student._id),
                name: student.name,
                roll: student.roll,
                year: student.year,
                department: student.department,
            })),
            selectedStudentId,
            calendar,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch parent attendance calendar', error: error.message });
    }
};