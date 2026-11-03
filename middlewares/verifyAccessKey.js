const httpErrors = require('http-errors');
const db = require('../models');

const verifyAccessKey = async (req, res, next) => {
    try {
        const accessKey = req.headers['access_key'];

        if (!accessKey) return res.status(403).json({
            message: "No access_key provided!",
            status: 403
        });

        const user = await db.User.findOne({ access_key: accessKey });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized! Invalid access_key",
                status: 401
            });
        }

        req.user = user;
        req.userId = user._id;
        req.role = user.role;

        next();
    } catch (error) {
        next(httpErrors.Unauthorized());
    }
};

const userOnly = (req, res, next) => {
    if (req.role !== 'user') {
        return res.status(403).json({
            message: "Access denied! Only users are allowed.",
            status: 403
        });
    }
    next();
};

const adminOnly = (req, res, next) => {
    if (req.role !== 'admin') {
        return res.status(403).json({
            message: "Access denied! Only admins are allowed.",
            status: 403
        });
    }
    next();
};

module.exports = {
    verifyAccessKey,
    userOnly,
    adminOnly
}; 