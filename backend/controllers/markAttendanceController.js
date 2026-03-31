const Attendance = require('../model/attendance');
const ActiveAttendanceSession = require('../model/activeAttendence');
const AttendStudent = require('../model/attendStudent');
const Classroom = require('../model/classroom');

exports.markAttendance = async (req, res) => {
    const { rollNumber, studentId, latitude, longitude } = req.body;

    if (!rollNumber || !studentId || !latitude || !longitude) {
        return res.status(400).json({ error: "Missing rollNumber or session data" });
    }

    try {
        const classrooms = await Classroom.find();
        const EPSILON = 0.0000010;

        const matchedClassroom = classrooms.find((classroom) => {
            const { lat1, lon1, lat2, lon2 } = classroom.boundaries;
            const minLat = Math.min(lat1, lat2);
            const maxLat = Math.max(lat1, lat2);
            const minLon = Math.min(lon1, lon2);
            const maxLon = Math.max(lon1, lon2);

            return (
                latitude >= (minLat - EPSILON) &&
                latitude <= (maxLat + EPSILON) &&
                longitude >= (minLon - EPSILON) &&
                longitude <= (maxLon + EPSILON)
            );
        });

        if (!matchedClassroom) {
            return res.status(403).json({ error: "You are not inside a classroom." });
        }

        const student = await AttendStudent.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const activeSession = await ActiveAttendanceSession.findOne({
            department: student.department,
            year: student.year,
            classNumber: matchedClassroom.name,
        });

        if (!activeSession) {
            return res.status(403).json({ error: "No active attendance session" });
        }

        const alreadyMarked = await Attendance.findOne({
            studentId,
            classNumber: matchedClassroom.name,
            department: student.department,
            year: student.year,
        });

        if (alreadyMarked) {
            return res.status(409).json({ message: "Attendance already marked." });
        }

        await Attendance.create({
            studentId,
            department: student.department,
            year: student.year,
            classNumber: matchedClassroom.name,
            classroomId: matchedClassroom._id,
            teacherId: activeSession.teacherId || '',
            institutionId: activeSession.institutionId || '',
            rollNumber, // storing the selected roll number too
        });

        return res.json({ message: "Attendance marked successfully!" });
    } catch (err) {
        console.error("Error marking attendance:", err);
        return res.status(500).json({ error: "Server error while marking attendance" });
    }
};
