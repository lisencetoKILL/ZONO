const mongoose = require('mongoose');

const zonoAdminSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        failedLoginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date, default: null },
        lastLoginAt: { type: Date, default: null },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('zono_admins', zonoAdminSchema);
