const Admin = require('../model/admin');
const Institution = require('../model/institution');
const Staff = require('../model/staff');
const Attendance = require('../model/attendance');
const Student = require('../model/student');
const Invitation = require('../model/invitation');
const { hashPassword, verifyPassword } = require('../utils/authUtils');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

        const admin = await Admin.findOne({ email }).populate('instituteId');
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

        req.session.user = {
            id: String(admin._id),
            email: admin.email,
            role: 'admin',
            name: admin.name,
            institutionId: String(admin.instituteId?._id || ''),
            institutionName: admin.instituteId?.name || '',
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

        const institution = await Institution.findById(currentUser.institutionId).lean();
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

        for (const row of entries) {
            const name = String(row?.name || '').trim();
            const email = String(row?.email || '').trim().toLowerCase();

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

            let existsInSystem = null;
            if (role === 'teacher') {
                existsInSystem = await Staff.findOne({ email }).lean();
            } else {
                existsInSystem = await Student.findOne({ email }).lean();
            }

            if (existsInSystem) {
                skipped.push({ name, email, reason: `${role} already exists` });
                continue;
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
                institutionId: currentUser.institutionId,
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