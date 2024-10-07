const express = require('express');
const router = express.Router();
const { Cart, CartItem, Product, ProductVariation, ProductAttribute, Attribute, VariationOption, VariationAttribute } = require('../models'); // Import VariationAttribute correctly
const authenticateToken = require('../middleware/authenticateToken');

// Apply authenticateToken middleware globally to all routes
router.use(authenticateToken);

// Helper function to get or create cart
async function getOrCreateCart(req) {
    let cart;
    if (req.user) {
        cart = await Cart.findOne({ where: { customer_id: req.user.id } });
        if (req.session.cartId) {
            const guestCart = await Cart.findOne({ where: { session_id: req.session.cartId } });
            if (guestCart) {
                if (!cart) {
                    guestCart.customer_id = req.user.id;
                    guestCart.session_id = null;
                    await guestCart.save();
                    cart = guestCart;
                } else {
                    const guestCartItems = await CartItem.findAll({ where: { cart_id: guestCart.id } });
                    for (const guestItem of guestCartItems) {
                        let existingItem = await CartItem.findOne({
                            where: {
                                cart_id: cart.id,
                                product_id: guestItem.product_id,
                                product_variation_id: guestItem.product_variation_id,
                                product_attribute_id: guestItem.product_attribute_id,
                                variation_attribute_id: guestItem.variation_attribute_id
                            }
                        });
                        if (existingItem) {
                            existingItem.quantity += guestItem.quantity;
                            await existingItem.save();
                        } else {
                            await CartItem.create({
                                cart_id: cart.id,
                                product_id: guestItem.product_id,
                                product_variation_id: guestItem.product_variation_id,
                                product_attribute_id: guestItem.product_attribute_id,
                                variation_attribute_id: guestItem.variation_attribute_id,
                                quantity: guestItem.quantity
                            });
                        }
                    }
                    await CartItem.destroy({ where: { cart_id: guestCart.id } });
                    await Cart.destroy({ where: { session_id: req.session.cartId } });
                }
                req.session.cartId = null;
            }
        }
        if (!cart) {
            cart = await Cart.create({ customer_id: req.user.id });
        }
    } else {
        if (!req.session.cartId) {
            const sessionId = req.sessionID;
            cart = await Cart.create({ session_id: sessionId });
            req.session.cartId = sessionId;
        } else {
            cart = await Cart.findOne({ where: { session_id: req.session.cartId } });
        }
    }
    return cart;
}

// Get cart items
router.get('/', async (req, res) => {
    try {
        const cart = await getOrCreateCart(req);

        const cartItems = await CartItem.findAll({
            where: { cart_id: cart.id },
            include: [
                { model: Product }, // Include basic product details
                {
                    model: ProductVariation,
                    include: [
                        {
                            model: VariationOption,
                            as: 'Options',
                            attributes: ['variation_type', 'value']
                        },
                        {
                            model: Attribute,
                            as: 'Attributes',
                            through: { model: VariationAttribute }, // Correct through model
                            attributes: ['id', 'attribute_type', 'attribute_value', 'sku'] // Corrected columns from Attributes
                        }
                    ]
                },
                {
                    model: ProductAttribute,
                    as: 'ProductAttribute', // Alias should match your association
                    attributes: ['id', 'stock', 'product_id', 'attribute_id'] // Correct columns from ProductAttribute
                }
            ]
        });

        res.json({ success: true, cartItems });
    } catch (err) {
        console.error('Error fetching cart items:', err);
        res.status(500).json({ success: false, message: 'Error fetching cart items', error: err.message });
    }
});


// Add item to cart
router.post('/', async (req, res) => {
    const { productId, quantity, selectedVariations, selectedAttributes } = req.body;
    try {
        const cart = await getOrCreateCart(req);
        let productVariation = null;
        let productAttributeId = null;
        let variationAttributeId = null;

        // Fetch product variations based on selected variations
        if (selectedVariations && Object.keys(selectedVariations).length > 0) {
            const productVariations = await ProductVariation.findAll({
                where: { product_id: productId },
                include: [{
                    model: VariationOption,
                    as: 'Options',
                    attributes: ['variation_type', 'value']
                }]
            });
            productVariation = productVariations.find(variation =>
                variation.Options.every(option =>
                    selectedVariations[option.variation_type] === option.value
                )
            );
            if (!productVariation) {
                return res.status(404).json({ success: false, message: 'Product variation not found' });
            }
            variationAttributeId = productVariation.id;
        }

        // Fetch product attributes based on selected attributes
        if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
            const attributeQuery = {
                attribute_type: Object.keys(selectedAttributes)[0],
                attribute_value: Object.values(selectedAttributes)[0]
            };
            const productAttribute = await ProductAttribute.findOne({ where: attributeQuery });
            if (productAttribute) {
                productAttributeId = productAttribute.id;
            } else {
                return res.status(404).json({ success: false, message: 'Product attribute not found' });
            }
        }

        let cartItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_id: productId,
                product_variation_id: variationAttributeId,
                product_attribute_id: productAttributeId
            }
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                cart_id: cart.id,
                product_id: productId,
                product_variation_id: variationAttributeId,
                product_attribute_id: productAttributeId,
                quantity
            });
        }

        res.status(201).json({ success: true, cartItem });
    } catch (err) {
        console.error('Error adding item to cart:', err);
        res.status(500).json({ success: false, message: 'Error adding item to cart', error: err.message });
    }
});

// Checkout route - requires user authentication
router.post('/checkout', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User authentication required for checkout' });
    }
    try {
        const cart = await getOrCreateCart(req);
        // Add logic for checking out and payment processing...
        res.json({ success: true, message: 'Checkout successful' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error during checkout', error: err.message });
    }
});

// Remove item from cart
router.delete('/:id', async (req, res) => {
    try {
        const cartItem = await CartItem.findOne({ where: { id: req.params.id } });
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        await cartItem.destroy();
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error removing item from cart', error: err.message });
    }
});

module.exports = router;
