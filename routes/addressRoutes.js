const express = require('express');
const router = express.Router();
const { Address } = require('../models');
const authenticateToken = require('../middleware/authenticateToken');

// Helper function to validate address_type
const validateAddressType = (type) => ['shipping', 'billing'].includes(type.toLowerCase());

// Get all addresses for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const addresses = await Address.findAll({ where: { customer_id: req.user.id } });
        res.json({ success: true, addresses });
    } catch (err) {
        console.error('Error fetching addresses:', err);
        res.status(500).json({ success: false, message: 'Error fetching addresses', error: err.message });
    }
});

// Get a specific address for the authenticated user
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const address = await Address.findOne({
            where: {
                id: req.params.id,
                customer_id: req.user.id
            }
        });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        res.json({ success: true, address });
    } catch (err) {
        console.error('Error fetching address:', err);
        res.status(500).json({ success: false, message: 'Error fetching address', error: err.message });
    }
});

// Create a new address for the authenticated user
router.post('/', authenticateToken, async (req, res) => {
    const { address_line1, address_line2, city, state, postal_code, country, address_type } = req.body;

    // Validate required fields
    if (!address_line1 || !city || !state || !postal_code || !country || !address_type) {
        return res.status(400).json({ success: false, message: 'All fields are required except address_line2' });
    }

    // Validate address_type
    if (!validateAddressType(address_type)) {
        return res.status(400).json({ success: false, message: 'Invalid address type. Must be either "shipping" or "billing".' });
    }

    try {
        const address = await Address.create({
            customer_id: req.user.id,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            address_type: address_type.toLowerCase()
        });
        res.status(201).json({ success: true, message: 'Address created successfully', address });
    } catch (err) {
        console.error('Error creating address:', err);
        res.status(500).json({ success: false, message: 'Error creating address', error: err.message });
    }
});

// Update an existing address for the authenticated user
router.put('/:id', authenticateToken, async (req, res) => {
    const { address_line1, address_line2, city, state, postal_code, country, address_type } = req.body;

    // Validate required fields
    if (!address_line1 || !city || !state || !postal_code || !country || !address_type) {
        return res.status(400).json({ success: false, message: 'All fields are required except address_line2' });
    }

    // Validate address_type
    if (!validateAddressType(address_type)) {
        return res.status(400).json({ success: false, message: 'Invalid address type. Must be either "shipping" or "billing".' });
    }

    try {
        const address = await Address.findOne({
            where: {
                id: req.params.id,
                customer_id: req.user.id
            }
        });

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await address.update({
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            address_type: address_type.toLowerCase()
        });

        res.json({ success: true, message: 'Address updated successfully', address });
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).json({ success: false, message: 'Error updating address', error: err.message });
    }
});

// Delete an address for the authenticated user
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const address = await Address.findOne({
            where: {
                id: req.params.id,
                customer_id: req.user.id
            }
        });

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await address.destroy();
        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (err) {
        console.error('Error deleting address:', err);
        res.status(500).json({ success: false, message: 'Error deleting address', error: err.message });
    }
});

module.exports = router;
