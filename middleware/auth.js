const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    console.log('Auth middleware called, token:', token);
    console.log('Headers:', req.headers);

    // Check if no token
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully, user ID:', decoded.userId);

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
        if (decoded.exp && decoded.exp < currentTime) {
            console.log('Token expired');
            return res.status(401).json({ message: 'Token has expired' });
        }

        

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Add user to request
        req.user = user;
        next();
    } catch (err) {
        console.log('Token verification failed:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
}; 