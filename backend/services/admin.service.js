const Admin = require('../model/admin');
const Institution = require('../model/institution');

let legacyInstitutionIndexCleanupPromise;

const createServiceError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const cleanupInstitution = async (institutionId) => {
    if (!institutionId) return;

    try {
        await Institution.findByIdAndDelete(institutionId);
    } catch (cleanupError) {
        // Best-effort rollback cleanup.
    }
};

const ensureLegacyInstitutionIndexesDropped = async () => {
    if (!legacyInstitutionIndexCleanupPromise) {
        legacyInstitutionIndexCleanupPromise = (async () => {
            try {
                const indexes = await Institution.collection.indexes();
                const hasLegacyCodeIndex = indexes.some((index) => index.name === 'code_1');

                if (hasLegacyCodeIndex) {
                    await Institution.collection.dropIndex('code_1');
                }
            } catch (error) {
                if (error?.codeName === 'NamespaceNotFound' || error?.code === 26) {
                    return;
                }

                throw error;
            }
        })();
    }

    await legacyInstitutionIndexCleanupPromise;
};

const registerAdmin = async ({ name, email, phone, instituteName, instituteAddress }) => {
    let institution;

    try {
        if (!name || !email || !phone || !instituteName) {
            throw createServiceError('name, email, phone and instituteName are required', 400);
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = phone.trim();
        const normalizedInstituteName = instituteName.trim();
        const normalizedInstituteAddress = instituteAddress?.trim();

        if (!normalizedName || !normalizedEmail || !normalizedPhone || !normalizedInstituteName) {
            throw createServiceError('name, email, phone and instituteName are required', 400);
        }

        const existingAdmin = await Admin.findOne({ email: normalizedEmail });
        if (existingAdmin) {
            throw createServiceError('Admin already exists with this email', 409);
        }

        await ensureLegacyInstitutionIndexesDropped();

        institution = await Institution.create({
            name: normalizedInstituteName,
            address: normalizedInstituteAddress,
            status: 'PENDING_APPROVAL',
        });

        const admin = await Admin.create({
            name: normalizedName,
            email: normalizedEmail,
            phone: normalizedPhone,
            role: 'ADMIN',
            instituteId: institution._id,
            status: 'PENDING_APPROVAL',
            firstLogin: true,
        });

        institution.adminId = admin._id;
        await institution.save();

        return {
            message: 'Admin and institution registered successfully',
            data: {
                adminId: String(admin._id),
                institutionId: String(institution._id),
            },
        };
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            await cleanupInstitution(institution?._id);
            if (duplicateField === 'email') {
                throw createServiceError('Admin already exists with this email', 409);
            }

            if (duplicateField) {
                throw createServiceError(`Duplicate value for ${duplicateField}`, 409);
            }

            throw createServiceError('Duplicate value found', 409);
        }

        await cleanupInstitution(institution?._id);

        throw createServiceError(error.message || 'Failed to register admin', 500);
    }
};

module.exports = {
    registerAdmin,
};
