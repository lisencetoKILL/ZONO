const requireUserAuth = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    return next();
};

const requireRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.session?.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: 'You do not have permission to access this resource' });
        }

        return next();
    };
};

const requireStudentAuth = (req, res, next) => {
    if (!req.session?.student) {
        return res.status(401).json({ message: 'Student authentication required' });
    }

    return next();
};

module.exports = {
    requireUserAuth,
    requireRoles,
    requireStudentAuth,
};