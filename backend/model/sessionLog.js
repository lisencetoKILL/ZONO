const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema(
    {
        sessionId: { type: String, required: true },
        userId: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, enum: ['staff', 'parent'], required: true },
        event: { type: String, enum: ['login', 'logout'], required: true },
        ipAddress: { type: String, default: '' },
        userAgent: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('sessionLog', sessionLogSchema);
