const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        role: { type: String, enum: ['teacher', 'student'], required: true },
        institutionId: { type: String, default: '' },
        institutionName: { type: String, default: '' },
        invitedByAdmin: { type: String, default: '' },
        status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'SENT'], default: 'PENDING' },
        respondedAt: { type: Date },
        respondedBy: { type: String, default: '' },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('invitations', invitationSchema);
