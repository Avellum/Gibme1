const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, ProductVariation, Attribute, Cart, CartItem } = require('../models');
const authenticateToken = require('../middleware/authenticateToken');

// Route to place an order
router.post('/', authenticateToken, async (req, res) => {
    const { shipping_address_id, payment_method } = req.body;
    try {
        const customer_id = req.user.id;
        const cart = await Cart.findOne({
            where: { customer_id },
            include: [
                {
                    model: CartItem,
                    include: [
                        { model: Product, attributes: ['id', 'name', 'price', 'main_image_url'] },
                        { model: ProductVariation, attributes: ['id', 'price', 'stock'] }
                    ]
                }
            ]
        });

        if (!cart || cart.CartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        let totalAmount = 0;

        const order = await Order.create({
            customer_id,
            total_amount: 0, // Placeholder; will be updated below
            order_status: 'pending',
            approved_state: false,
            shipping_address_id,
            shipping_charge: 0, // Update this based on actual shipping logic
            estimated_days: 3, // Placeholder for delivery estimation
            payment_method // Store payment method
        });

        await Promise.all(cart.CartItems.map(async (item) => {
            const price = item.ProductVariation ? item.ProductVariation.price : item.Product.price;
            totalAmount += price * item.quantity;

            await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                product_variation_id: item.product_variation_id,
                attribute_id: item.attribute_id,
                quantity: item.quantity,
                price
            });

            // Reduce stock levels
            if (item.ProductVariation) {
                await item.ProductVariation.decrement('stock', { by: item.quantity });
            } else {
                await item.Product.decrement('stock', { by: item.quantity });
            }
        }));

        // Update the total amount for the order
        await order.update({ total_amount: totalAmount });

        // Clear the cart after placing the order
        await CartItem.destroy({ where: { cart_id: cart.id } });

        res.json({ success: true, message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ success: false, message: 'Error placing order', error: error.message });
    }
});


// Route to get the most recent order for the authenticated user
router.get('/recent', authenticateToken, async (req, res) => {
    try {
        const customer_id = req.user.id;
        console.log('Customer ID:', customer_id);

        const order = await Order.findOne({
            where: { customer_id },
            include: [
                {
                    model: OrderItem,
                    include: [
                        { model: Product},
                        { model: ProductVariation},
                        { model: Attribute}
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        console.log('Fetched Order:', JSON.stringify(order, null, 2));
        if (!order) {
            return res.json({ success: false, message: "No recent order found." });
        }

        res.json({ success: true, order });
    } catch (error) {
        console.error('Error fetching the most recent order:', error);
        res.status(500).json({ success: false, message: 'Error fetching the most recent order', error: error.message });
    }
});


// Route to get all orders for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const customer_id = req.user.id;
        console.log('Fetching orders for customer_id:', customer_id); // Debugging log

        const orders = await Order.findAll({
            where: { customer_id },
            include: [
                {
                    model: OrderItem,
                    include: [
                        { model: Product }, // Fetch all attributes from Product
                        { model: ProductVariation }, // Fetch all attributes from ProductVariation
                        { model: Attribute } // Fetch all attributes from Attribute
                    ]
                }
            ],
            order: [['created_at', 'DESC']] // Order by most recent first
        });

        console.log('Orders found:', JSON.stringify(orders, null, 2)); // Debugging log

        if (orders.length === 0) {
            return res.json({ success: true, orders: [], message: "No orders found." });
        }

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching orders:', error); // This will log the error stack trace
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
});


module.exports = router;
