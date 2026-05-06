const Admin = require('../model/admin');
const Institution = require('../model/institution');
const Staff = require('../model/staff');
const Attendance = require('../model/attendance');
const Student = require('../model/student');
const Invitation = require('../model/invitation');
const AttendStudent = require('../model/attendStudent');
const Parent = require('../model/parent');
const { hashPassword, verifyPassword } = require('../utils/authUtils');
const { emitToTeacher, normalizeEmail } = require('../utils/socket');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{7,15}$/;

const normalizeParentContact = (rawValue = '') => {
    const value = String(rawValue || '').trim();
    if (!value) return { type: 'unknown', value: '' };

    const normalizedEmail = value.toLowerCase();
    if (EMAIL_REGEX.test(normalizedEmail)) {
        return { type: 'email', value: normalizedEmail };
    }

    const normalizedPhone = value.replace(/\D/g, '');
    if (PHONE_REGEX.test(normalizedPhone)) {
        return { type: 'phone', value: normalizedPhone };
    }

    return { type: 'unknown', value };
};

const generateParentEmailFromPhone = async (phone) => {
    const base = `parent_${phone}`;
    let suffix = 0;

    while (true) {
        const candidate = `${base}${suffix ? `_${suffix}` : ''}@zono.local`;
        const exists = await Parent.findOne({ email: candidate }).lean();
        if (!exists) {
            return candidate;
        }
        suffix += 1;
    }
};

const ensureParentAccountForContact = async ({ contactType, contactValue, studentName }) => {
    if (contactType === 'email') {
        const existing = await Parent.findOne({ email: contactValue });
        if (existing) return existing;

        const placeholderPassword = await hashPassword(`otp-only-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        return Parent.create({
            name: `Parent of ${studentName || 'Student'}`,
            email: contactValue,
            phone: '',
            password: placeholderPassword,
        });
    }

    if (contactType === 'phone') {
        const existing = await Parent.findOne({ phone: contactValue });
        if (existing) return existing;

        const generatedEmail = await generateParentEmailFromPhone(contactValue);
        const placeholderPassword = await hashPassword(`otp-only-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        return Parent.create({
            name: `Parent of ${studentName || 'Student'}`,
            email: generatedEmail,
            phone: contactValue,
            password: placeholderPassword,
        });
    }

    return null;
};

const generateInstitutionCode = (name = '') => {
    const base = name
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 6)
        .toUpperCase()
        .padEnd(4, 'X');

    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${base}${suffix}`;
};

const requireAdmin = (req, res) => {
    if (!req.session?.user || req.session.user.role !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return null;
    }

    return req.session.user;
};

const requireInstitutionUser = (req, res) => {
    const user = req.session?.user;
    if (!user || !['admin', 'staff'].includes(user.role)) {
        res.status(403).json({ message: 'Institution user access required' });
        return null;
    }

    if (!user.institutionId) {
        res.status(403).json({ message: 'You are not linked to any institution' });
        return null;
    }

    return user;
};

const extractInstitutionIdFromAdmin = (adminDoc) => {
    if (!adminDoc) return '';

    const primary = adminDoc.institutionId;
    if (primary) return String(primary._id || primary);

    const legacy = adminDoc.instituteId || adminDoc?._doc?.instituteId;
    if (legacy) return String(legacy._id || legacy);

    return '';
};

exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password, institutionName } = req.body;

        if (!name || !email || !password || !institutionName) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Admin already exists with this email' });
        }

        let institutionCode = generateInstitutionCode(institutionName);
        while (await Institution.findOne({ code: institutionCode })) {
            institutionCode = generateInstitutionCode(institutionName);
        }

        const institution = await Institution.create({
            name: institutionName,
            code: institutionCode,
            adminIds: [],
        });

        const admin = await Admin.create({
            name,
            email,
            password: await hashPassword(password),
            institutionId: institution._id,
        });

        institution.createdBy = admin._id;
        institution.adminIds = [admin._id];
        await institution.save();

        return res.status(201).json({
            message: 'Admin registered successfully',
            institution: {
                id: String(institution._id),
                name: institution.name,
                code: institution.code,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to register admin', error: error.message });
    }
};

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.json({ message: 'No record found' });
        }

        if (admin.status !== 'ACTIVE') {
            return res.status(403).json({ message: 'Your institution application is still under review' });
        }

        const isValidPassword = await verifyPassword(password, admin.password);
        if (!isValidPassword) {
            return res.json({ message: 'Failed', error: 'Invalid password' });
        }

        const institutionId = extractInstitutionIdFromAdmin(admin);
        if (!institutionId) {
            return res.status(400).json({ message: 'Admin account is not linked to any institution' });
        }

        const institution = await Institution.findById(institutionId).lean();
        if (!institution) {
            return res.status(404).json({ message: 'Linked institution not found' });
        }

        // One-time repair for legacy records saved with instituteId instead of institutionId.
        if (!admin.institutionId) {
            admin.institutionId = institutionId;
            await admin.save();
        }

        req.session.user = {
            id: String(admin._id),
            email: admin.email,
            role: 'admin',
            name: admin.name,
            institutionId,
            institutionName: institution.name || '',
            loginAt: new Date().toISOString(),
        };

        return res.json({ message: 'Success', user: req.session.user });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to login admin', error: error.message });
    }
};

exports.getInstitutionMeta = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        let institutionId = currentUser.institutionId;

        if (!institutionId) {
            const admin = await Admin.findById(currentUser.id).select('institutionId instituteId').lean();
            institutionId = extractInstitutionIdFromAdmin(admin);

            if (institutionId && req.session?.user) {
                req.session.user.institutionId = institutionId;
            }
        }

        const institution = await Institution.findById(institutionId).lean();
        if (!institution) {
            return res.status(404).json({ message: 'Institution not found' });
        }

        return res.json({
            institution: {
                id: String(institution._id),
                name: institution.name,
                code: institution.code,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch institution details', error: error.message });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const teachers = await Staff.find({ institutionId: currentUser.institutionId })
            .select('firstName lastName email role createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ teachers });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch teachers', error: error.message });
    }
};

exports.createTeacher = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingTeacher = await Staff.findOne({ email });
        if (existingTeacher) {
            return res.status(409).json({ message: 'Teacher already exists with this email' });
        }

        const teacher = await Staff.create({
            firstName,
            lastName,
            email,
            password: await hashPassword(password),
            role: 'teacher',
            institutionId: currentUser.institutionId,
            managedByAdmin: currentUser.id,
        });

        return res.status(201).json({
            message: 'Teacher created successfully',
            teacher: {
                id: String(teacher._id),
                firstName: teacher.firstName,
                lastName: teacher.lastName,
                email: teacher.email,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create teacher', error: error.message });
    }
};

exports.unlinkTeacherFromInstitution = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const teacherId = String(req.params?.teacherId || '').trim();
        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher id is required' });
        }

        const teacher = await Staff.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const adminInstitutionId = String(currentUser.institutionId || '').trim();
        const teacherInstitutionId = String(teacher.institutionId || '').trim();

        if (!teacherInstitutionId || teacherInstitutionId !== adminInstitutionId) {
            return res.status(403).json({ message: 'Teacher is not linked to your institution' });
        }

        teacher.institutionId = '';
        teacher.managedByAdmin = '';
        await teacher.save();

        return res.json({
            message: 'Teacher removed from institution successfully',
            teacher: {
                id: String(teacher._id),
                email: teacher.email || '',
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to remove teacher from institution', error: error.message });
    }
};

exports.listStudentsForParentLinking = async (req, res) => {
    try {
        const currentUser = requireInstitutionUser(req, res);
        if (!currentUser) return;

        const students = await AttendStudent.find({})
            .select('name roll year department parentContact')
            .sort({ year: 1, department: 1, roll: 1 })
            .lean();

        return res.json({ students });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch students for parent linking', error: error.message });
    }
};

exports.updateStudentParentContact = async (req, res) => {
    try {
        const currentUser = requireInstitutionUser(req, res);
        if (!currentUser) return;

        const studentId = String(req.params?.studentId || '').trim();
        const parentContactInput = String(req.body?.parentContact || '').trim();

        if (!studentId) {
            return res.status(400).json({ message: 'Student id is required' });
        }

        if (!parentContactInput) {
            return res.status(400).json({ message: 'Parent contact number is required' });
        }

        const parsedContact = normalizeParentContact(parentContactInput);
        if (parsedContact.type === 'unknown') {
            return res.status(400).json({ message: 'Parent contact must be a valid email or phone number' });
        }

        const student = await AttendStudent.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.parentContact = parsedContact.value;
        await student.save();

        const parent = await ensureParentAccountForContact({
            contactType: parsedContact.type,
            contactValue: parsedContact.value,
            studentName: student.name,
        });

        return res.json({
            message: 'Parent contact updated successfully',
            student: {
                id: String(student._id),
                name: student.name,
                parentContact: student.parentContact,
            },
            parent: parent
                ? {
                    id: String(parent._id),
                    email: parent.email,
                    phone: parent.phone || '',
                }
                : null,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update parent contact', error: error.message });
    }
};

exports.getAttendanceAnalytics = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const institutionId = currentUser.institutionId;

        const [summary, teacherRows] = await Promise.all([
            Attendance.aggregate([
                { $match: { institutionId } },
                {
                    $group: {
                        _id: null,
                        totalAttendanceRecords: { $sum: 1 },
                        uniqueStudents: { $addToSet: '$studentId' },
                        activeTeachers: { $addToSet: '$teacherId' },
                    },
                },
            ]),
            Attendance.aggregate([
                { $match: { institutionId } },
                {
                    $group: {
                        _id: '$teacherId',
                        attendanceCount: { $sum: 1 },
                        latestMarkedAt: { $max: '$markedAt' },
                    },
                },
                { $sort: { attendanceCount: -1 } },
            ]),
        ]);

        const teacherIds = teacherRows.map((row) => row._id).filter(Boolean);
        const teachers = await Staff.find({ _id: { $in: teacherIds } })
            .select('firstName lastName email')
            .lean();

        const teacherMap = new Map(teachers.map((teacher) => [String(teacher._id), teacher]));

        const teacherAnalytics = teacherRows.map((row) => {
            const teacher = teacherMap.get(String(row._id));
            return {
                teacherId: String(row._id || ''),
                teacherName: teacher
                    ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || teacher.email
                    : 'Unknown Teacher',
                teacherEmail: teacher?.email || '',
                attendanceCount: row.attendanceCount,
                latestMarkedAt: row.latestMarkedAt,
            };
        });

        const summaryRow = summary[0] || {
            totalAttendanceRecords: 0,
            uniqueStudents: [],
            activeTeachers: [],
        };

        return res.json({
            summary: {
                totalAttendanceRecords: summaryRow.totalAttendanceRecords,
                uniqueStudents: summaryRow.uniqueStudents.length,
                activeTeachers: summaryRow.activeTeachers.filter(Boolean).length,
            },
            teacherAnalytics,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to load analytics', error: error.message });
    }
};

exports.getAdminProfile = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const admin = await Admin.findById(currentUser.id).select('name email phone role status firstLogin').lean();
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        return res.json({
            profile: {
                id: String(admin._id),
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                status: admin.status,
                firstLogin: admin.firstLogin,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch admin profile', error: error.message });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const { name, email, phone } = req.body;

        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'Name, email and phone are required' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const admin = await Admin.findById(currentUser.id);

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const duplicateEmailAdmin = await Admin.findOne({
            email: normalizedEmail,
            _id: { $ne: admin._id },
        });

        if (duplicateEmailAdmin) {
            return res.status(409).json({ message: 'Another admin already uses this email' });
        }

        admin.name = String(name).trim();
        admin.email = normalizedEmail;
        admin.phone = String(phone).trim();
        await admin.save();

        req.session.user = {
            ...req.session.user,
            name: admin.name,
            email: admin.email,
        };

        return res.json({
            message: 'Profile updated successfully',
            profile: {
                id: String(admin._id),
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                status: admin.status,
                firstLogin: admin.firstLogin,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

exports.changeAdminPassword = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' });
        }

        if (String(newPassword).length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        const admin = await Admin.findById(currentUser.id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (!admin.password) {
            return res.status(400).json({ message: 'Password setup is incomplete for this account' });
        }

        admin.password = await hashPassword(newPassword);
        admin.firstLogin = false;
        await admin.save();

        return res.json({ message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update password', error: error.message });
    }
};

exports.listAdminInvitations = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const role = String(req.query?.role || 'all').toLowerCase();
        const filter = {
            institutionId: currentUser.institutionId,
        };

        if (role === 'teacher' || role === 'student') {
            filter.role = role;
        }

        const invitations = await Invitation.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ invitations });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch invitations', error: error.message });
    }
};

exports.createAdminInvitations = async (req, res) => {
    try {
        const currentUser = requireAdmin(req, res);
        if (!currentUser) return;

        const role = String(req.body?.role || '').toLowerCase();
        const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];

        if (!['teacher', 'student'].includes(role)) {
            return res.status(400).json({ message: 'Role must be teacher or student' });
        }

        if (!entries.length) {
            return res.status(400).json({ message: 'At least one invite entry is required' });
        }

        const seen = new Set();
        const created = [];
        const skipped = [];

        const institution = await Institution.findById(currentUser.institutionId).select('name').lean();
        const institutionName = institution?.name || '';

        for (const row of entries) {
            const name = String(row?.name || '').trim();
            const email = normalizeEmail(row?.email);

            if (!name || !email || !EMAIL_REGEX.test(email)) {
                skipped.push({ name, email, reason: 'Invalid name/email' });
                continue;
            }

            const dedupeKey = `${role}:${email}`;
            if (seen.has(dedupeKey)) {
                skipped.push({ name, email, reason: 'Duplicate row in request' });
                continue;
            }
            seen.add(dedupeKey);

            if (role === 'teacher') {
                const existingTeacher = await Staff.findOne({ email }).lean();
                if (existingTeacher) {
                    const currentInstitutionId = String(currentUser.institutionId || '').trim();
                    const existingInstitutionId = String(existingTeacher.institutionId || '').trim();

                    if (existingInstitutionId) {
                        if (existingInstitutionId === currentInstitutionId) {
                            skipped.push({ name, email, reason: 'Teacher already linked to this institution' });
                        } else {
                            skipped.push({ name, email, reason: 'Teacher belongs to another institution' });
                        }
                        continue;
                    }
                }
            } else {
                const existingStudent = await Student.findOne({ email }).lean();
                if (existingStudent) {
                    skipped.push({ name, email, reason: `${role} already exists` });
                    continue;
                }
            }

            const existingInvite = await Invitation.findOne({
                institutionId: currentUser.institutionId,
                role,
                email,
                status: 'PENDING',
            }).lean();

            if (existingInvite) {
                skipped.push({ name, email, reason: 'Pending invite already exists' });
                continue;
            }

            const invite = await Invitation.create({
                name,
                email,
                role,
                institutionId: String(currentUser.institutionId || ''),
                institutionName,
                invitedByAdmin: currentUser.id,
                status: 'PENDING',
            });

            created.push({
                id: String(invite._id),
                name: invite.name,
                email: invite.email,
                role: invite.role,
                status: invite.status,
            });

            if (role === 'teacher') {
                emitToTeacher(email, 'teacher-invite-created', {
                    id: String(invite._id),
                    role: invite.role,
                    name: invite.name,
                    email: invite.email,
                    institutionId: invite.institutionId,
                    institutionName: invite.institutionName,
                    status: invite.status,
                    createdAt: invite.createdAt,
                });
            }
        }

        return res.status(201).json({
            message: 'Invitations processed',
            result: {
                requested: entries.length,
                createdCount: created.length,
                skippedCount: skipped.length,
                created,
                skipped,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to process invitations', error: error.message });
    }
};

exports.listTeacherInvitations = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'staff') {
            return res.status(403).json({ message: 'Teacher access required' });
        }

        const teacherEmail = normalizeEmail(req.session.user.email);
        if (!teacherEmail) {
            return res.status(400).json({ message: 'Teacher email not available in session' });
        }

        const statusFilter = String(req.query?.status || 'pending').toUpperCase();
        const filter = {
            role: 'teacher',
            email: teacherEmail,
        };

        if (statusFilter !== 'ALL') {
            filter.status = statusFilter;
        }

        const invitations = await Invitation.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ invitations });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch teacher invitations', error: error.message });
    }
};

exports.respondTeacherInvitation = async (req, res) => {
    try {
        if (!req.session?.user || req.session.user.role !== 'staff') {
            return res.status(403).json({ message: 'Teacher access required' });
        }

        const teacherEmail = normalizeEmail(req.session.user.email);
        const invitationId = req.params?.invitationId;
        const action = String(req.body?.action || '').toLowerCase();

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be accept or reject' });
        }

        const invitation = await Invitation.findOne({
            _id: invitationId,
            role: 'teacher',
            email: teacherEmail,
        });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        if (invitation.status !== 'PENDING') {
            return res.status(409).json({ message: 'Invitation already responded' });
        }

        if (action === 'accept') {
            const teacher = await Staff.findById(req.session.user.id);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher account not found' });
            }

            const currentInstitutionId = String(teacher.institutionId || '').trim();
            const invitedInstitutionId = String(invitation.institutionId || '').trim();

            if (!invitedInstitutionId) {
                return res.status(400).json({ message: 'Invitation has invalid institution' });
            }

            if (currentInstitutionId && currentInstitutionId !== invitedInstitutionId) {
                return res.status(409).json({ message: 'Teacher already linked to another institution' });
            }

            teacher.institutionId = invitedInstitutionId;
            teacher.managedByAdmin = String(invitation.invitedByAdmin || '');
            teacher.role = teacher.role || 'teacher';
            await teacher.save();

            if (req.session?.user) {
                req.session.user.institutionId = invitedInstitutionId;
                await new Promise((resolve, reject) => {
                    req.session.save((err) => {
                        if (err) return reject(err);
                        return resolve();
                    });
                });
            }

            invitation.status = 'ACCEPTED';
        } else {
            invitation.status = 'REJECTED';
        }

        invitation.respondedAt = new Date();
        invitation.respondedBy = String(req.session.user.id || '');
        await invitation.save();

        emitToTeacher(teacherEmail, 'teacher-invite-updated', {
            id: String(invitation._id),
            status: invitation.status,
            respondedAt: invitation.respondedAt,
        });

        return res.json({
            message: action === 'accept' ? 'Invitation accepted' : 'Invitation rejected',
            invitation: {
                id: String(invitation._id),
                status: invitation.status,
            },
            sessionUser: req.session?.user || null,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to respond to invitation', error: error.message });
    }
};