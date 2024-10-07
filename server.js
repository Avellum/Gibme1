const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const session = require('express-session');
const db = require('./models');
const path = require('path');
const fs = require('fs');
const https = require('https');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Read the SSL certificate and key
const httpsOptions = {
    key: fs.readFileSync('localhost-key.pem'),
    cert: fs.readFileSync('localhost.pem')
};

// Session middleware setup should come before any routes or middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    }
}));

// Middleware for parsing requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

const authenticateToken = require('./middleware/authenticateToken');
const ensureCartExists = require('./middleware/ensureCartExists');

// Apply authenticateToken middleware to routes
app.use('/api/orders', authenticateToken, require('./routes/orderRoutes'));

// Other routes can be protected similarly if they require authentication.

// Authentication routes
app.get('/api/config/google-client-id', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

app.post('/api/auth/google', async (req, res) => {
    const { id_token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userId = payload['sub'];

        let user = await db.Customer.findOne({ where: { email: payload.email } });
        if (!user) {
            user = await db.Customer.create({
                first_name: payload.given_name,
                last_name: payload.family_name,
                email: payload.email,
                password_hash: '',
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


app.post('/api/auth/signup', async (req, res) => {
    const { first_name, last_name, email, password, phone_number } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.Customer.create({
            first_name,
            last_name,
            email,
            password_hash: hashedPassword,
            phone_number,
        });
        res.status(201).json({ success: true, user });
    } catch (err) {
        console.error('Error during sign up:', err);
        res.status(500).json({ success: false, message: 'Error during sign up', error: err.message });
    }
});

app.post('/api/auth/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.Customer.findOne({ where: { email } });
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ success: true, token, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during sign in:', err);
        res.status(500).json({ success: false, message: 'Error during sign in', error: err.message });
    }
});


app.post('/api/auth/verify', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Failed to authenticate token' });
        }

        try {
            const user = await db.Customer.findByPk(decoded.id);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.json({ success: true, user });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to authenticate token', error: error.message });
        }
    });
});

// Routes for the application
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', authenticateToken, require('./routes/orderRoutes')); // This should be fine now

// Static page routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'auth.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'product.html'));
});

app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'search.html'));
});

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'account.html'));
});

app.get('/address', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'address.html'));
});

app.get('/personal_info', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'personal_info.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'checkout.html'));
});

app.get('/orderhistory', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'orderhistory.html'));
});

app.get('/orderconfirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'orderConfirmation.html'));
});

// Admin static page routes
app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'dashboard.html'));
});
app.get('/admin/productmanagement', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin', 'productmanagement.html'));
});

// Use the admin routes
const adminRoutes = require('./routes/adminroutes');
app.use('/admin', adminRoutes);

// Route to refresh JWT token
app.post('/api/auth/refresh', authenticateToken, (req, res) => {
    const user = req.user;
    const newToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token: newToken });
});

// Sync database and start the HTTPS server
db.sequelize.sync({ force: false })
    .then(() => {

        console.log('Database synced ');
        https.createServer(httpsOptions, app).listen(PORT, () => {
            console.log(`HTTPS Server is running on https://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to sync database:', err);
    });
