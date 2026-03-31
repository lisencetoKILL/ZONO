const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        address: { type: String, trim: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admins' },
        status: {
            type: String,
            enum: ['PENDING_APPROVAL', 'ACTIVE'],
            default: 'PENDING_APPROVAL',
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

module.exports = mongoose.model('institutions', institutionSchema);