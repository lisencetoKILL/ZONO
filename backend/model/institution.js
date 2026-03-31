const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        adminIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Institution', institutionSchema);