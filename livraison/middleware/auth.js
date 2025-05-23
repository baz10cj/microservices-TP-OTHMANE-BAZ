const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Access denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const verified = jwt.verify(token, 'secretkey');
        req.user = verified;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
