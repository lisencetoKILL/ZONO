const AttendStudent = require("../model/attendStudent");
const Classroom = require("../model/classroom")
const ActiveAttendanceSession = require("../model/activeAttendence");

exports.attendStudent = async (req, res) => {
    try {
        console.log("Inside controller");

        const newAttendStudent = new AttendStudent(req.body);
        await newAttendStudent.save();

        console.log("Data inserted successfully");
        res.status(201).json({ message: "Attendance recorded successfully" });

    } catch (error) {
        console.error("Error saving data:", error);
        res.status(500).json({ error: "Failed to record attendance" });
    }
};

exports.login = async (req, res) => {
    try {
        const { ien, password } = req.body;
        const student = await AttendStudent.findOne({ ien });

        if (!student) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (student.password !== password) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // ✅ Store session
        req.session.student = {
            _id: student._id,
            name: student.name,
            ien: student.ien
        };

        req.session.save(err => {
            if (err) {
                console.error("❌ Session Save Error:", err);
                return res.status(500).json({ message: "Session not saved", error: err });
            }

            console.log("✅ Session Stored Successfully:", req.session);
            res.json({ message: "Login successful", student: { name: student.name } });
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getStudentSession = (req, res) => {
    // console.log("Session Data:", req.session);

    if (req.session.student) {
        // Example sessionActive logic
        const sessionActive = true;
        const rollList = []; // Add roll numbers here based on your logic

        return res.json({
            loggedIn: true,
            student: req.session.student,
            sessionActive,
            rollList
        });
    } else {
        return res.json({ loggedIn: false, message: "Not logged in" });
    }
};



exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out successfully" });
    });
};

exports.checkActiveAttendance = async (req, res) => {
    const { latitude, longitude, studentId } = req.body;

    if (!latitude || !longitude || !studentId) {
        return res.status(400).json({ error: "Missing latitude, longitude or studentId" });
    }

    try {
        // Step 1: Find classroom that this student is inside
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
            return res.json({ inside: false, message: "Student is not inside any classroom" });
        }

        // Step 2: Find student details
        const student = await AttendStudent.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Step 3: Check for active session for this department, year, and classNumber
        const activeSession = await ActiveAttendanceSession.findOne({
            department: student.department,
            year: student.year,
            classNumber: matchedClassroom.name,
        });

        if (!activeSession) {
            return res.json({ active: false, message: "No active attendance session" });
        }

        // Step 4: Fetch roll list for that class
        const studentsInClass = await AttendStudent.find({
            department: student.department,
            year: student.year,
        }).select("roll");

        const rollList = studentsInClass.map((s) => s.roll).sort((a, b) => a - b);

        // Success response
        return res.json({
            inside: true,
            active: true,
            classroom: matchedClassroom.name,
            rollList,
        });

    } catch (err) {
        console.error("Error in poll-attendance:", err);
        return res.status(500).json({ error: "Server error during polling" });
    }
};

