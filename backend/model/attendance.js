const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AttendStudent',
        required: true
    },
    department: String,
    year: String,
    classNumber: String,
    classroomId: String,
    teacherId: { type: String, default: '' },
    institutionId: { type: String, default: '' },
    markedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
