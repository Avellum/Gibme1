const express = require('express');
const router = express.Router();
const { Category } = require('../models');

// Route to get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

module.exports = router;
