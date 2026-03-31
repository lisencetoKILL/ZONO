const express = require('express');
const router = express.Router();
const Student = require('../model/student'); // Correct path to Student model
const reportController = require('../controllers/reportController');
const attendStudentController = require("../controllers/attendStudentController");
const AttendStudent = require("../model/attendStudent");
const classroomController = require("../controllers/classroomController");
const facultyController = require("../controllers/facultyController");
const markAttendanceController = require("../controllers/markAttendanceController")
const adminController = require('../controllers/adminController');
const { requireUserAuth, requireRoles, requireStudentAuth } = require('../middleware/authMiddleware');


router.get('/students', requireUserAuth, requireRoles('staff', 'admin'), async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students); // Send the selected student data as JSON
    } catch (error) {
        res.status(500).json({ error: 'Error fetching students' });
    }
});

router.post('/students/:studentId/report', requireUserAuth, requireRoles('staff', 'admin'), reportController.createReport);

router.get('/attendStudent', requireUserAuth, requireRoles('staff', 'admin'), async (req, res) => {
    try {
        const { year, department } = req.query; // Get year and department from query params
        const filter = {};

        if (year) filter.year = year;
        if (department) filter.department = department;

        const students = await AttendStudent.find(filter);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching attendance data' });
    }
});

router.post("/loginStudent", attendStudentController.login);

router.post("/logout", attendStudentController.logout);
router.get("/session", attendStudentController.getStudentSession)

//Enter Students ------------------------------------------
// router.post('/attendStudent', attendStudent)




//classroom routes
router.post("/classrooms/add", requireUserAuth, requireRoles('staff', 'admin'), classroomController.addClassroom);

// Route to get all classrooms
router.get("/classrooms", requireUserAuth, requireRoles('staff', 'admin'), classroomController.getClassrooms);
// Update classroom details (Name, Department & Boundaries)
router.put("/classrooms/update/:id", requireUserAuth, requireRoles('staff', 'admin'), classroomController.updateClassroom);

router.post("/checklocation", requireStudentAuth, classroomController.checkIfInClassroom)

router.post("/start-attendance", requireUserAuth, requireRoles('staff', 'admin'), facultyController.startAttendance);
router.post("/poll-attendance", requireStudentAuth, attendStudentController.checkActiveAttendance)
router.post('/mark-attendance', requireStudentAuth, markAttendanceController.markAttendance);

router.get('/admin/institution', requireUserAuth, requireRoles('admin'), adminController.getInstitutionMeta);
router.get('/admin/teachers', requireUserAuth, requireRoles('admin'), adminController.getTeachers);
router.post('/admin/teachers', requireUserAuth, requireRoles('admin'), adminController.createTeacher);
router.get('/admin/analytics', requireUserAuth, requireRoles('admin'), adminController.getAttendanceAnalytics);

module.exports = router;