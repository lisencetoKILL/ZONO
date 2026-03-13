require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const staff = require("./model/staff");
const studentController = require('./controllers/studentController');
const router = require('./routes/router');
const attendStudentModel = require("./model/attendStudent");

// ------------------ DATABASE CONNECTION ------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// ------------------ APP SETUP ------------------
const app = express();
const port = process.env.PORT || 3001;

// ------------------ MIDDLEWARE ------------------
app.use(cors({
    origin: ['http://localhost:5173'], // Add more domains if needed
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());

// ------------------ SESSION SETUP ------------------
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions"
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true,
    }
}));

// ------------------ AUTH ROUTES ------------------
app.post('/register', (req, res) => {
    staff.create(req.body)
        .then(staffs => res.json(staffs))
        .catch(err => res.status(500).json(err));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    staff.findOne({ email })
        .then(user => {
            if (!user) return res.json({ message: "No record found" });
            if (user.password !== password)
                return res.json({ message: "Failed", error: "Invalid password" });

            req.session.user = { email: user.email, name: user.name };
            res.json({ message: "Success", user: req.session.user });
        })
        .catch(err => res.status(500).json(err));
});

// Check active session
app.get('/home', (req, res) => {
    res.json({
        loggedIn: !!req.session.user,
        user: req.session.user || null
    });
});

// ------------------ ATTENDANCE DATA ------------------
app.get('/api/attendStudent', async (req, res) => {
    try {
        const filter = { ...req.query };
        const students = await attendStudentModel.find(filter);
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: "Error fetching attendance data" });
    }
});

// ------------------ QR DATA SUBMISSION ------------------
app.post('/api', studentController.saveStudentData);

// Use additional routes
app.use('/api', router);

// ------------------ START SERVER ------------------
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
