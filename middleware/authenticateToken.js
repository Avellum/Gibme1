// authenticateToken.js

const jwt = require('jsonwebtoken');
const db = require('../models');

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // No token provided, treating as a guest user
        console.log('No token provided, treating as guest');
        return next(); // Skip setting req.user, continue as guest
    }

    // Verify token if present
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
            console.log('Token verification failed:', err);
            return res.sendStatus(403); // Forbidden if token is invalid
        }

        try {
            const user = await db.Customer.findByPk(decodedToken.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            req.user = user; // Set req.user to the authenticated user
            console.log('User authenticated:', req.user.id);
            next();
        } catch (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ success: false, message: 'Error fetching user' });
        }
    });
}

module.exports = authenticateToken;
