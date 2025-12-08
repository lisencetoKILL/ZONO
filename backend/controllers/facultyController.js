// controller/facultyController.js
const ActiveAttendanceSession = require("../model/activeAttendence");

exports.startAttendance = async (req, res) => {
    try {
        const { department, year, classNumber, classroomId } = req.body;
        console.log("Starting session with data:", req.body);

        // Optional: Clear existing session if already active
        await ActiveAttendanceSession.deleteMany({ department, year, classNumber });

        // Create new session (auto expires after 1 minute)
        const newSession = await ActiveAttendanceSession.create({
            department,
            year,
            classNumber,
            classroomId,
        });

        res.status(200).json({ success: true, message: "Attendence Session Started", session: newSession });
    } catch (err) {
        console.error("Error starting attendance:", err);
        res.status(500).json({ error: "Failed to start attendance" });
    }
};
