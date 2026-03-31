const parentModel = require('../model/parent');
const ParentOtp = require('../model/parentOtp');
const SessionLog = require('../model/sessionLog');
const { hashPassword, verifyPassword } = require('../utils/authUtils');
const { generateOtp, sendOtpEmail } = require('../utils/otpUtils');

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

exports.requestParentOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const parent = await parentModel.findOne({ email });
        if (!parent) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        const otp = generateOtp();
        const otpHash = await hashPassword(otp);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await ParentOtp.deleteMany({ email });
        await ParentOtp.create({
            email,
            otpHash,
            expiresAt,
            attempts: 0,
        });

        const mailResult = await sendOtpEmail({ to: email, otp, appName: 'Zono' });

        if (!mailResult.sent) {
            if (process.env.NODE_ENV === 'production') {
                return res.status(500).json({ message: 'Failed to send OTP email. Please contact support.' });
            }

            console.log(`[DEV OTP] ${email}: ${otp}`);
            return res.status(200).json({
                message: 'OTP generated. SMTP not configured, using development OTP.',
                otpExpiresInSeconds: OTP_EXPIRY_MS / 1000,
                devOtp: otp,
            });
        }

        return res.status(200).json({
            message: 'OTP sent successfully',
            otpExpiresInSeconds: OTP_EXPIRY_MS / 1000,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};

exports.verifyParentOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const parent = await parentModel.findOne({ email });
        if (!parent) {
            return res.status(404).json({ message: 'Parent account not found' });
        }

        const otpRecord = await ParentOtp.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
        }

        if (new Date() > otpRecord.expiresAt) {
            await ParentOtp.deleteMany({ email });
            return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
        }

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            await ParentOtp.deleteMany({ email });
            return res.status(429).json({ message: 'Too many invalid attempts. Please request a new OTP.' });
        }

        const isValidOtp = await verifyPassword(String(otp), otpRecord.otpHash);

        if (!isValidOtp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(401).json({ message: 'Invalid OTP' });
        }

        await ParentOtp.deleteMany({ email });

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