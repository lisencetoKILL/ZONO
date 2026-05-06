const nodemailer = require('nodemailer');

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const normalizePhoneForSms = (phone = '') => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';

    if (digits.length === 10) {
        return `+91${digits}`;
    }

    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }

    if (digits.startsWith('0') && digits.length > 10) {
        return `+${digits.slice(1)}`;
    }

    return digits.startsWith('+') ? digits : `+${digits}`;
};

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

const sendOtpSms = async ({ to, otp, appName = 'Zono' }) => {
    const TEXTBELT_API_KEY = process.env.TEXTBELT_API_KEY;
    if (!TEXTBELT_API_KEY) {
        return { sent: false, reason: 'sms_api_not_configured' };
    }

    const formattedPhone = normalizePhoneForSms(to);
    if (!formattedPhone) {
        return { sent: false, reason: 'invalid_phone_number' };
    }

    const message = `${appName} OTP: ${otp}. Valid for 5 minutes.`;

    const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            phone: formattedPhone,
            message,
            key: TEXTBELT_API_KEY,
        }),
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
        return {
            sent: false,
            reason: data?.error || `textbelt_http_${response.status}`,
        };
    }

    return { sent: true };
};

module.exports = {
    generateOtp,
    sendOtpEmail,
    sendOtpSms,
    normalizePhoneForSms,
};