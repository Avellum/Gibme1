const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/products'); // Set the directory for file uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Set the file name with timestamp
    }
});

const upload = multer({ storage: storage });

// Route to render the product management page with categories
router.get('/productmanagement', productController.getProductManagementPage);

// API route to fetch categories as JSON
router.get('/productmanagement/categories', productController.getCategories);

// Route to handle product management actions
router.post('/product/add', upload.single('main_image'), productController.addProduct);
router.post('/product/edit', upload.single('main_image'), productController.editProduct); // Add multer middleware here
router.post('/product/delete', productController.deleteProduct);


// Similarly, create routes for managing images, variations, and attributes

module.exports = router;
