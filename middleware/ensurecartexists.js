const { Cart } = require('../models');

async function ensureCartExists(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        // Check for a guest cart in the session
        if (req.session.cartId) {
            let guestCart = await Cart.findByPk(req.session.cartId);
            if (guestCart) {
                // Transfer guest cart to the authenticated user
                guestCart.customer_id = req.user.id;
                await guestCart.save();

                // Clear the session cartId after transfer
                req.session.cartId = null;
                req.cart = guestCart;
                return next();
            }
        }

        // If no guest cart, ensure an authenticated cart exists
        let cart = await Cart.findOne({ where: { customer_id: req.user.id } });
        if (!cart) {
            cart = await Cart.create({ customer_id: req.user.id });
        }
        req.cart = cart;
        next();
    } catch (err) {
        console.error('Error ensuring cart exists:', err);
        res.status(500).json({ success: false, message: 'Error ensuring cart exists', error: err.message });
    }
}

module.exports = ensureCartExists;
