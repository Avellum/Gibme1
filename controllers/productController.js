const { Product, Category, ProductImage, ProductVariation } = require('../models'); // Import the models
const path = require('path'); // Import the path module to handle file paths

// Function to render the Product Management Page
exports.getProductManagementPage = async (req, res) => {
    try {
        const categories = await Category.findAll(); // Fetch all categories
        res.sendFile(path.join(__dirname, '../views/admin/productmanagement.html'));
    } catch (err) {
        console.error('Error loading the product management page:', err);
        res.status(500).send('Error loading the product management page');
    }
};

// Function to fetch categories as JSON
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll(); // Fetch all categories
        res.json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).send('Error fetching categories');
    }
};

// Function to add a new product
exports.addProduct = async (req, res) => {
    try {
        const { name, sku, description, price, stock, category_id } = req.body;
        const main_image_url = req.file ? `images/products/${req.file.filename}` : null;

        if (!name || !sku || !description || !price || !stock || !category_id) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        await Product.create({
            name,
            sku,
            description,
            price,
            stock,
            category_id,
            main_image_url
        });

        res.redirect('/admin/productmanagement');
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).json({ success: false, message: 'Error adding product' });
    }
};

// Function to edit an existing product
exports.editProduct = async (req, res) => {
    try {
        const { id, name, sku, description, price, stock, category_id } = req.body;
        const main_image_url = req.file ? `images/products/${req.file.filename}` : null;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        const updateData = { name, sku, description, price, stock, category_id };
        if (main_image_url) {
            updateData.main_image_url = main_image_url;
        }

        const result = await Product.update(updateData, { where: { id } });

        if (result[0] === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.redirect('/admin/productmanagement');
    } catch (err) {
        console.error('Error editing product:', err);
        res.status(500).json({ success: false, message: 'Error editing product' });
    }
};

// Function to delete a product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        const result = await Product.destroy({ where: { id } });

        if (result === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        res.redirect('/admin/productmanagement');
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ success: false, message: 'Error deleting product' });
    }
};

// Function to add a product image
exports.addProductImage = async (req, res) => {
    try {
        const { productId } = req.body;
        const imageUrl = req.file ? `/images/products/${req.file.filename}` : null;

        if (!productId || !imageUrl) {
            return res.status(400).json({ success: false, message: 'Product ID and image are required.' });
        }

        await ProductImage.create({
            product_id: productId,
            image_url: imageUrl
        });

        res.redirect('/admin/productmanagement');
    } catch (err) {
        console.error('Error adding product image:', err);
        res.status(500).send('Error adding product image');
    }
};

// Function to remove a product image
exports.removeProductImage = async (req, res) => {
    try {
        const { imageId } = req.body;

        if (!imageId) {
            return res.status(400).json({ success: false, message: 'Image ID is required.' });
        }

        await ProductImage.destroy({
            where: { id: imageId }
        });

        res.redirect('/admin/productmanagement');
    } catch (err) {
        console.error('Error removing product image:', err);
        res.status(500).send('Error removing product image');
    }
};

// Function to add a product variation
exports.addProductVariation = async (req, res) => {
    try {
        const { productId, variationName, variationValue } = req.body;

        if (!productId || !variationName || !variationValue) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        await ProductVariation.create({
            product_id: productId,
            variation_name: variationName,
            variation_value: variationValue
        });

        res.redirect('/admin/productmanagement');
    } catch (err) {
        console.error('Error adding product variation:', err);
        res.status(500).send('Error adding product variation');
    }
};

// Function to edit a product variation
exports.editProductVariation = async (req, res) => {
    try {
        const { variationId, variationName, variationValue } = req.body;

        if (!variationId || !variationName || !variationValue) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        await ProductVariation.update({
            variation_name: variationName,
            variation_value: variationValue
        }, {
            where: { id: variationId }
        });

        res.redirect('/admin/productmanagement');
    } catch (err) {
        console.error('Error editing product variation:', err);
        res.status(500).send('Error editing product variation');
    }
};

// Function to remove a product variation
exports.removeProductVariation = async (req, res) => {
    try {
        const { variationId } = req.body;

        if (!variationId) {
            return res.status(400).json({ success: false, message: 'Variation ID is required.' });
        }

        await ProductVariation.destroy({
            where: { id: variationId }
        });

        res.redirect('/admin/productmanagement');
    } catch (err) {
        console.error('Error removing product variation:', err);
        res.status(500).send('Error removing product variation');
    }
};
