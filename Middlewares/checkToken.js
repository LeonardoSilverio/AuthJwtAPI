const jwt = require('jsonwebtoken');
const statusCode = require("../Server/statusCode");

function checkToken(req,res,next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({
            message: 'Access denied. No token provided.'
        });
    };

    const secret = process.env.JWT_SECRET;	

    try {
        jwt.verify(token, secret);
        next();
    }
    catch(err) {
        return res.status(statusCode['UNAUTHORIZED']).json({
            message: 'Access denied. Invalid token.'
        });
    }
}

module.exports = checkToken;