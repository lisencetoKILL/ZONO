const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        role: { type: String, enum: ['teacher', 'student'], required: true },
        institutionId: { type: String, default: '' },
        invitedByAdmin: { type: String, default: '' },
        status: { type: String, enum: ['PENDING', 'SENT'], default: 'PENDING' },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('invitations', invitationSchema);
