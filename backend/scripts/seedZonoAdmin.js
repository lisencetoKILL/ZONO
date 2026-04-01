require('dotenv').config();
const mongoose = require('mongoose');
const ZonoAdmin = require('../model/zonoAdmin');
const { hashPassword } = require('../utils/authUtils');

const seedZonoAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is missing in environment');
        }

        await mongoose.connect(process.env.MONGO_URI);

        const username = 'jaymakwana';
        const plainPassword = 'qwerty1234';
        const password = await hashPassword(plainPassword);

        await ZonoAdmin.findOneAndUpdate(
            { username },
            {
                username,
                password,
                isActive: true,
                failedLoginAttempts: 0,
                lockUntil: null,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('ZonoAdmin account seeded successfully.');
    } catch (error) {
        console.error('Failed to seed ZonoAdmin account:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedZonoAdmin();
