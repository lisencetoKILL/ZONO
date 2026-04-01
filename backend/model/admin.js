const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, default: '' },
        phone: { type: String, required: true, trim: true },
        role: { type: String, default: 'ADMIN' },
        instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'institutions' },
        status: {
            type: String,
            enum: ['PENDING_APPROVAL', 'ACTIVE'],
            default: 'PENDING_APPROVAL',
        },
        firstLogin: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

module.exports = mongoose.model('admins', adminSchema);