let ioInstance = null;

const setIo = (io) => {
    ioInstance = io;
};

const getIo = () => ioInstance;

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const teacherRoom = (email = '') => `teacher:${normalizeEmail(email)}`;

const emitToTeacher = (email, event, payload) => {
    if (!ioInstance) return;
    ioInstance.to(teacherRoom(email)).emit(event, payload);
};

module.exports = {
    setIo,
    getIo,
    teacherRoom,
    emitToTeacher,
    normalizeEmail,
};
