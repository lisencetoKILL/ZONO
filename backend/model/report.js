const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',  // Assuming you have a Student model
        required: true,
    },
    report: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
