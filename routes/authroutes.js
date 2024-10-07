const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// User registration
router.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password, phone_number } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.Customer.create({
            first_name,
            last_name,
            email,
            password_hash: hashedPassword,
            phone_number
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

const ensureCartExists = require('../middleware/ensureCartExists'); // Import the middleware

// User login
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.Customer.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Ensure cart exists for authenticated user and transfer guest cart if necessary
        req.user = user;  // Manually set req.user here
        await ensureCartExists(req, res, async () => {
            // Now the user's cart has been ensured or transferred
            res.json({ message: 'Login successful', token, user });
        });

    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});


// Google Sign-In
router.post('/google', async (req, res) => {
    const { id_token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID // Securely using your Google Client ID from .env
        });
        const payload = ticket.getPayload();
        const userId = payload['sub'];

        let user = await db.Customer.findOne({ where: { email: payload.email } });
        if (!user) {
            user = await db.Customer.create({
                first_name: payload.given_name,
                last_name: payload.family_name,
                email: payload.email,
                password_hash: '', // No password needed for Google Sign-In users
                phone_number: '',
                profile_url: payload.picture
            });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, token, user });
    } catch (err) {
        console.error('Error verifying Google ID token:', err);
        res.status(500).json({ success: false, message: 'Error verifying Google ID token', error: err.message });
    }
});

// User logout
router.post('/logout', (req, res) => {
    // Clear session and token (you may want to adjust this depending on your session setup)
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('token'); // Assuming you store token in cookies
        res.json({ message: 'Logout successful' });
    });
});


module.exports = router;
