const { registerAdmin } = require('../services/admin.service');

const registerAdminController = async (req, res) => {
    try {
        await registerAdmin(req.body);

        return res.status(201).json({
            message: 'Registration successful. ZonoAdmins will contact you within 4-5 business days.',
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message =
            statusCode === 500
                ? 'Failed to register admin'
                : error.message;

        return res.status(statusCode).json({ message });
    }
};

module.exports = {
    registerAdminController,
};
