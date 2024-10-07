const express = require('express');
const router = express.Router();
const { Customer, Address } = require('../models');
const authenticateToken = require('../middleware/authenticateToken');

// Fetch customer details including address
router.get('/details', authenticateToken, async (req, res) => {
    try {
        const customer = await Customer.findByPk(req.user.id, {
            include: [{ model: Address }]
        });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ success: true, customer });
    } catch (err) {
        console.error('Error fetching customer details:', err);
        res.status(500).json({ message: 'Error fetching customer details', error: err.message });
    }
});

// Update customer information
router.post('/update', authenticateToken, async (req, res) => {
    const { first_name, last_name, email, phone_number } = req.body;

    try {
        const customer = await Customer.findByPk(req.user.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        // Update customer details
        customer.first_name = first_name;
        customer.last_name = last_name;
        customer.email = email;
        customer.phone_number = phone_number;
        await customer.save();

        res.json({ success: true, message: 'Customer information updated successfully' });
    } catch (err) {
        console.error('Error updating customer information:', err);
        res.status(500).json({ success: false, message: 'Error updating customer information', error: err.message });
    }
});

module.exports = router;
