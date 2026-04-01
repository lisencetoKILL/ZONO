const crypto = require('crypto');
const Institution = require('../model/institution');
const Admin = require('../model/admin');
const ZonoAdmin = require('../model/zonoAdmin');
const { hashPassword, verifyPassword } = require('../utils/authUtils');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const generateStrongPassword = (length = 14) => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    const bytes = crypto.randomBytes(length);

    let password = '';
    for (let i = 0; i < length; i += 1) {
        password += alphabet[bytes[i] % alphabet.length];
    }

    return password;
};

const loginZonoAdmin = async (req, res) => {
    try {
        const username = String(req.body?.username || '').trim().toLowerCase();
        const password = String(req.body?.password || '');

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const account = await ZonoAdmin.findOne({ username });
        if (!account || !account.isActive) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (account.lockUntil && account.lockUntil.getTime() > Date.now()) {
            const waitMinutes = Math.ceil((account.lockUntil.getTime() - Date.now()) / 60000);
            return res.status(423).json({ message: `Account temporarily locked. Try again in ${waitMinutes} minute(s).` });
        }

        const isValidPassword = await verifyPassword(password, account.password);
        if (!isValidPassword) {
            const attempts = account.failedLoginAttempts + 1;
            account.failedLoginAttempts = attempts;
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                account.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
                account.failedLoginAttempts = 0;
            }
            await account.save();

            return res.status(401).json({ message: 'Invalid credentials' });
        }

        account.failedLoginAttempts = 0;
        account.lockUntil = null;
        account.lastLoginAt = new Date();
        await account.save();

        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to create secure session' });
            }

            req.session.user = {
                id: String(account._id),
                username: account.username,
                role: 'zono_admin',
                name: 'Zono Admin',
                loginAt: new Date().toISOString(),
            };

            return res.status(200).json({ message: 'Success', user: req.session.user });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to login ZonoAdmin', error: error.message });
    }
};

const listInstitutionApplications = async (req, res) => {
    try {
        const status = String(req.query?.status || 'ALL').toUpperCase();
        const filter = status === 'ALL' ? {} : { status };

        const institutions = await Institution.find(filter)
            .populate('adminId', 'name email phone status createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ institutions });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch institutions', error: error.message });
    }
};

const approveInstitutionApplication = async (req, res) => {
    try {
        const { institutionId } = req.params;
        const institution = await Institution.findById(institutionId);

        if (!institution) {
            return res.status(404).json({ message: 'Institution not found' });
        }

        if (!institution.adminId) {
            return res.status(400).json({ message: 'Institution has no linked admin account' });
        }

        const admin = await Admin.findById(institution.adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Linked admin not found' });
        }

        const generatedPassword = generateStrongPassword();
        admin.password = await hashPassword(generatedPassword);
        admin.status = 'ACTIVE';
        admin.firstLogin = true;
        await admin.save();

        institution.status = 'ACTIVE';
        await institution.save();

        return res.status(200).json({
            message: 'Institution approved and credentials generated',
            credentials: {
                adminEmail: admin.email,
                generatedPassword,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to approve institution', error: error.message });
    }
};

const getZonoAdminSummary = async (req, res) => {
    try {
        const [pendingCount, activeCount, totalCount] = await Promise.all([
            Institution.countDocuments({ status: 'PENDING_APPROVAL' }),
            Institution.countDocuments({ status: 'ACTIVE' }),
            Institution.countDocuments({}),
        ]);

        return res.json({
            summary: {
                pendingApplications: pendingCount,
                activeInstitutions: activeCount,
                totalInstitutions: totalCount,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch summary', error: error.message });
    }
};

module.exports = {
    loginZonoAdmin,
    listInstitutionApplications,
    approveInstitutionApplication,
    getZonoAdminSummary,
};
