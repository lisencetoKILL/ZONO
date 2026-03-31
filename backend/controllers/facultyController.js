// controller/facultyController.js
const ActiveAttendanceSession = require("../model/activeAttendence");

exports.startAttendance = async (req, res) => {
    try {
        const { department, year, classNumber, classroomId } = req.body;
        const teacherId = req.session?.user?.role === 'staff' ? req.session.user.id : req.body.teacherId;
        const institutionId = req.session?.user?.institutionId || req.body.institutionId || '';
        console.log("Starting session with data:", req.body);

        // Optional: Clear existing session if already active
        await ActiveAttendanceSession.deleteMany({ department, year, classNumber, teacherId });

        // Create new session (auto expires after 1 minute)
        const newSession = await ActiveAttendanceSession.create({
            department,
            year,
            classNumber,
            classroomId,
            teacherId,
            institutionId,
        });

        res.status(200).json({ success: true, message: "Attendence Session Started", session: newSession });
    } catch (err) {
        console.error("Error starting attendance:", err);
        res.status(500).json({ error: "Failed to start attendance" });
    }
};
