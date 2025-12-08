const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    branch: { type: String, required: true },
    ien: { type: String, required: true },
    uid: { type: String, required: true },
    batch: { type: String, required: true },
    email: { type: String, required: true },
    admissionYear: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    parentsContact: { type: String, required: true },
    studentsContact: { type: String, required: true },
    category: { type: String, required: true },
    year: { type: String, required: true },
    outTime: { type: Date },
    createdAt: { type: Date, default: Date.now },
    timestamp: { type: Date, required: true }, // This field must be added
    qrData: Object
});

module.exports = mongoose.model('Student', studentSchema);
