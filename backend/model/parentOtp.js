const mongoose = require('mongoose');

const parentOtpSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900,
    },
});

module.exports = mongoose.model('ParentOtp', parentOtpSchema);