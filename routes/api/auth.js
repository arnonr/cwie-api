const express = require("express");
const router = express.Router();
const controllers = require("../../controllers/AuthController");

function getClientInfo(req) {
    return {
        ip: getClientIp(req),
        userAgent: req.headers['user-agent'] || 'Unknown'
    };
}

function getClientIp(req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Middleware to attach client info to the request object
router.use((req, res, next) => {
    req.clientInfo = getClientInfo(req);
    next();
});

router.post("/login", controllers.onLogin);
router.post("/register", controllers.onRegister);
router.post("/search-icit-account", controllers.onSearchIcitAccount);
module.exports = router;
