require('dotenv').config();
const http = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { Server } = require('socket.io');
const staff = require("./model/staff");
const parent = require("./model/parent");
const SessionLog = require('./model/sessionLog');
const studentController = require('./controllers/studentController');
const router = require('./routes/router');
const adminRegistrationRoutes = require('./routes/adminRegistrationRoutes');
const zonoAdminRoutes = require('./routes/zonoAdminRoutes');
const adminController = require('./controllers/adminController');
const parentAuthController = require('./controllers/parentAuthController');
const { hashPassword, verifyPassword } = require('./utils/authUtils');
const { setIo, teacherRoom, normalizeEmail } = require('./utils/socket');

const zonoAdminApiBasePath = process.env.ZONO_ADMIN_API_PATH || '/api/zono-secure-admin';
const frontendOrigins = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || process.env.FRONTEND_API || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (frontendOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

// ------------------ DATABASE CONNECTION ------------------
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// ------------------ APP SETUP ------------------
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3001;

app.set('trust proxy', 1);

// ------------------ MIDDLEWARE ------------------
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: frontendOrigins,
        credentials: true,
    },
});

setIo(io);

io.on('connection', (socket) => {
    socket.on('join-teacher-room', (payload = {}) => {
        const email = normalizeEmail(payload.email);
        if (!email) return;
        socket.join(teacherRoom(email));
    });
});

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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
    }
}));

// ------------------ AUTH ROUTES ------------------
app.post('/register', async (req, res) => {
    try {
        const { role, email, password, ...data } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const hashedPassword = await hashPassword(password);

        if (role === 'parent') {
            const existingParent = await parent.findOne({ email });
            if (existingParent) {
                return res.status(409).json({ message: 'Parent already exists with this email' });
            }

            const user = await parent.create({ ...data, email, password: hashedPassword });
            return res.json(user);
        }

        const existingStaff = await staff.findOne({ email });
        if (existingStaff) {
            return res.status(409).json({ message: 'Staff already exists with this email' });
        }

        const user = await staff.create({ ...data, email, password: hashedPassword });
        return res.json(user);
    } catch (err) {
        return res.status(500).json(err);
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    staff.findOne({ email })
        .then(async user => {
            if (!user) return res.json({ message: "No record found" });

            const isValidPassword = await verifyPassword(password, user.password);
            if (!isValidPassword)
                return res.json({ message: "Failed", error: "Invalid password" });

            const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

            req.session.user = {
                id: String(user._id),
                email: user.email,
                role: 'staff',
                name: displayName,
                institutionId: user.institutionId || '',
                loginAt: new Date().toISOString(),
            };

            await SessionLog.create({
                sessionId: req.sessionID,
                userId: user._id,
                email: user.email,
                role: 'staff',
                event: 'login',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] || '',
            });

            res.json({ message: "Success", user: req.session.user });
        })
        .catch(err => res.json({ message: "Error", error: err }));
});

app.post('/admin/login', async (req, res) => {
    const result = await adminController.loginAdmin(req, res);
    if (res.headersSent) return result;

    if (req.session?.user?.role === 'admin') {
        try {
            await SessionLog.create({
                sessionId: req.sessionID,
                userId: req.session.user.id,
                email: req.session.user.email,
                role: 'admin',
                event: 'login',
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] || '',
            });
        } catch (error) {
            // Continue even if session logging fails.
        }
    }
});

app.post('/parent/request-otp', parentAuthController.requestParentOtp);
app.post('/parent/verify-otp', parentAuthController.verifyParentOtp);

app.post('/loginParent', (req, res) => {
    return res.status(410).json({
        message: 'Parent password login is no longer supported. Please use OTP login.',
    });
});

app.get('/auth/session', (req, res) => {
    res.json({
        loggedIn: !!req.session.user,
        user: req.session.user || null,
    });
});

app.post('/auth/logout', async (req, res) => {
    const currentUser = req.session.user;

    if (!currentUser) {
        return res.status(200).json({ message: 'Already logged out' });
    }

    try {
        await SessionLog.create({
            sessionId: req.sessionID,
            userId: currentUser.id,
            email: currentUser.email,
            role: currentUser.role,
            event: 'logout',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || '',
        });

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Logout failed' });
            }

            res.clearCookie('connect.sid');
            return res.status(200).json({ message: 'Logged out successfully' });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Logout failed', error: error.message });
    }
});

// ------------------ QR DATA SUBMISSION ------------------
app.post('/api', studentController.saveStudentData);

// Use additional routes
app.use('/api', router);
app.use('/api/admin', adminRegistrationRoutes);
app.use(zonoAdminApiBasePath, zonoAdminRoutes);

// ------------------ START SERVER ------------------
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
