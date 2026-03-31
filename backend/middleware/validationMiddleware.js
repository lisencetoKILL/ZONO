const Joi = require('joi');

const adminRegistrationSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    email: Joi.string().trim().email().required(),
    phone: Joi.string().trim().min(1).required(),
    instituteName: Joi.string().trim().min(1).required(),
    instituteAddress: Joi.string().trim().optional(),
});

const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.details.map((detail) => detail.message),
            });
        }

        req.body = value;
        return next();
    };
};

const validateAdminRegistration = validateBody(adminRegistrationSchema);

module.exports = {
    adminRegistrationSchema,
    validateBody,
    validateAdminRegistration,
};