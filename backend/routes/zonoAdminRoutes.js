const express = require('express');
const {
    loginZonoAdmin,
    listInstitutionApplications,
    approveInstitutionApplication,
    getZonoAdminSummary,
} = require('../controllers/zonoAdminController');
const { requireZonoAdminAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', loginZonoAdmin);
router.get('/summary', requireZonoAdminAuth, getZonoAdminSummary);
router.get('/institutions', requireZonoAdminAuth, listInstitutionApplications);
router.post('/institutions/:institutionId/approve', requireZonoAdminAuth, approveInstitutionApplication);

module.exports = router;
