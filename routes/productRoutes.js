const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product, ProductVariation, VariationOption, Promotion, ProductImage, Attribute, ProductAttribute, VariationAttribute, Cart, CartItem } = require('../models');
const multer = require('multer');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/products');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Initialize multer with storage settings
const upload = multer({ storage: storage });

// Search products by query
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }
        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { id: query },
                    { name: { [Op.like]: `%${query}%` } },
                    { sku: { [Op.like]: `%${query}%` } }
                ]
            }
        });
        if (products.length > 0) {
            res.json(products);
        } else {
            res.status(404).json({ message: 'No products found' });
        }
    } catch (err) {
        console.error('Error searching for products:', err);
        res.status(500).json({ message: 'Error searching for products', error: err.message });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (err) {
        console.error('Error fetching all products:', err);
        res.status(500).json({ message: 'Error fetching all products', error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: ProductVariation,
                    as: 'Variations', // This alias should match your Product model
                    include: [
                        {
                            model: VariationOption,
                            as: 'Options',
                            attributes: ['variation_type', 'value']
                        },
                        {
                            model: Attribute,
                            as: 'Attributes', // Matches the alias for VariationAttribute in ProductVariation
                            through: {
                                model: VariationAttribute,
                                attributes: ['stock']
                            },
                            attributes: ['id','attribute_type', 'attribute_value', 'sku']
                        }
                    ]
                },
                {
                    model: Attribute,
                    as: 'Attributes', // Matches the alias for ProductAttribute in Product
                    through: {
                        model: ProductAttribute,
                        attributes: ['stock']
                    },
                    attributes: ['id','attribute_type', 'attribute_value', 'sku']
                },
                { model: Promotion, as: 'Promotions' },
                { model: ProductImage, as: 'images' }
            ]
        });

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        res.status(500).json({ message: 'Error fetching product by ID', error: err.message });
    }
});




// Add item to cart
router.post('/api/cart', async (req, res) => {
    try {
        const { productId, quantity, selectedVariations, selectedAttributes } = req.body;
        const cartId = req.session.cartId || req.headers['x-cart-id']; // Get cart ID from session or header

        // Validate product existence
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Find or create the cart
        let cart = await Cart.findByPk(cartId);
        if (!cart) {
            cart = await Cart.create({ customer_id: req.session.customerId || null });
            req.session.cartId = cart.id; // Save cart ID in session
        }

        // Prepare attributes for saving
        let productAttributeId = null;
        let productVariationId = null;

        // Extract product attribute
        if (selectedAttributes) {
            for (const attrType in selectedAttributes) {
                const attribute = selectedAttributes[attrType];
                const productAttribute = await ProductAttribute.findOne({
                    where: { id: attribute.id }
                });
                if (productAttribute) {
                    productAttributeId = productAttribute.id;
                }
            }
        }

        // Extract variation attribute (if any)
        if (selectedVariations) {
            for (const varType in selectedVariations) {
                const variation = selectedVariations[varType];
                const productVariation = await ProductVariation.findOne({
                    where: { product_id: productId }
                });
                if (productVariation) {
                    productVariationId = productVariation.id;
                }
            }
        }

        // Add item to cart with attributes or variation
        const cartItem = await CartItem.create({
            cart_id: cart.id,
            product_id: productId,
            product_variation_id: productVariationId || null,
            product_attribute_id: productAttributeId || null,
            quantity
        });

        res.json({ success: true, cartItem });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ error: 'Error adding item to cart' });
    }
});

// Create/add a new product with main image upload
router.post('/', upload.single('main_image'), async (req, res) => {
    try {
        const { name, sku, description, price, stock, category_id } = req.body;
        const main_image_url = req.file ? `images/products/${req.file.filename}` : null;

        const newProduct = await Product.create({
            name, sku, description, price, stock, category_id, main_image_url
        });

        if (req.body.variationSKU && Array.isArray(req.body.variationSKU)) {
            const variations = await ProductVariation.bulkCreate(req.body.variationSKU.map((sku, index) => ({
                product_id: newProduct.id,
                sku,
                price: req.body.variationPrice[index],
                stock: req.body.variationStock[index],
            })));

            // Now add the variation options
            if (req.body.variationOptions) {
                for (let i = 0; i < variations.length; i++) {
                    const variation = variations[i];
                    const options = req.body.variationOptions[i];
                    await VariationOption.bulkCreate(options.map(option => ({
                        product_variation_id: variation.id,
                        variation_type: option.type,
                        value: option.value,
                    })));
                }
            }
        }

        if (req.body.promotionDiscount && Array.isArray(req.body.promotionDiscount)) {
            const promotions = req.body.promotionDiscount.map((discount_percentage, index) => ({
                product_id: newProduct.id,
                discount_percentage,
                start_date: req.body.promotionStart[index],
                end_date: req.body.promotionEnd[index],
            }));
            await Promotion.bulkCreate(promotions);
        }

        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating new product:', err);
        res.status(500).json({ message: 'Error creating new product', error: err.message });
    }
});

// Route for handling image uploads
router.post('/images', upload.array('images', 10), async (req, res) => {
    try {
        const product_id = req.body.product_id;
        const files = req.files;

        const images = files.map(file => ({
            product_id,
            image_url: 'images/products/' + file.filename
        }));

        await ProductImage.bulkCreate(images);
        res.status(201).json({ message: 'Images uploaded successfully!' });
    } catch (err) {
        console.error('Error uploading images:', err);
        res.status(500).json({ message: 'Error uploading images', error: err.message });
    }
});

// Edit an existing product with main image upload
router.post('/edit', upload.single('main_image'), async (req, res) => {
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
});

// Delete a product by ID
router.post('/delete', async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Product ID is required.' });
        }

        const deleted = await Product.destroy({ where: { id } });

        if (deleted) {
            res.status(200).json({ message: 'Product deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Product not found.' });
        }
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: 'Error deleting product', error: err.message });
    }
});

module.exports = router;
