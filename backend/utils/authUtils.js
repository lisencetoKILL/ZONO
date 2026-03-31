const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = async (plainPassword = '') => {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const verifyPassword = async (plainPassword = '', storedPassword = '') => {
    if (!storedPassword) return false;

    // Backward compatibility for existing plaintext passwords.
    if (!storedPassword.startsWith('$2a$') && !storedPassword.startsWith('$2b$') && !storedPassword.startsWith('$2y$')) {
        return plainPassword === storedPassword;
    }

    return bcrypt.compare(plainPassword, storedPassword);
};

module.exports = {
    hashPassword,
    verifyPassword,
};