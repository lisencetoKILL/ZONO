const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, trim: true, default: '' },
        password: { type: String, required: true },
        role: { type: String, default: 'ADMIN' },
        institutionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'institutions',
            required: true,
            alias: 'instituteId',
        },
        status: {
            type: String,
            enum: ['PENDING_APPROVAL', 'ACTIVE'],
            default: 'PENDING_APPROVAL',
        },
        firstLogin: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
    },
    {
        collection: 'admins',
        timestamps: true,
    }
);

module.exports = mongoose.model('Admin', adminSchema);