const mongoose = require('mongoose');

const activeAttendanceSchema = new mongoose.Schema({
    department: String,
    year: String,
    date: String,
    classNumber: String,
    classroomId: String, // or coordinates if needed
    teacherId: { type: String, default: '' },
    institutionId: { type: String, default: '' },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 120, // expire after 2 minute (auto-remove using TTL index)
    }
});

module.exports = mongoose.model('ActiveAttendanceSession', activeAttendanceSchema);
