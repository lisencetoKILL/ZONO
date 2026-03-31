const express = require('express');
const { validateAdminRegistration } = require('../middleware/validationMiddleware');
const { registerAdminController } = require('../controllers/adminRegistrationController');

const router = express.Router();

router.post('/register', validateAdminRegistration, registerAdminController);

module.exports = router;
