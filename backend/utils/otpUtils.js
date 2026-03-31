const nodemailer = require('nodemailer');

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOtpEmail = async ({ to, otp, appName = 'Zono' }) => {
    const {
        SMTP_HOST,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASS,
        SMTP_FROM,
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
        return { sent: false, reason: 'smtp_not_configured' };
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject: `${appName} Parent Login OTP`,
        text: `Your ${appName} OTP is ${otp}. It will expire in 5 minutes.`,
        html: `<p>Your <strong>${appName}</strong> OTP is <strong style="font-size:20px;letter-spacing:2px;">${otp}</strong>.</p><p>This code expires in 5 minutes.</p>`,
    });

    return { sent: true };
};

module.exports = {
    generateOtp,
    sendOtpEmail,
};