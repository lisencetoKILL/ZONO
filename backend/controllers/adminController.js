const Admin = require('../model/admin');
const Institution = require('../model/institution');
const Staff = require('../model/staff');
const Attendance = require('../model/attendance');
const { hashPassword, verifyPassword } = require('../utils/authUtils');

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

        const admin = await Admin.findOne({ email }).populate('institutionId');
        if (!admin) {
            return res.json({ message: 'No record found' });
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
            institutionId: String(admin.institutionId?._id || ''),
            institutionName: admin.institutionId?.name || '',
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