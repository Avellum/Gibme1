const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from a .env file into process.env
dotenv.config();

// Initialize Sequelize with database credentials from environment variables
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql', // Specifies the SQL dialect being used
    logging: false  // Enable logging of SQL queries (useful for debugging)
});

// Define an object to store models and Sequelize instance
const db = {};

// Assign Sequelize constructor and instance to db object for later use
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import and initialize models
db.Customer = require('./customer.js')(sequelize, DataTypes);
db.Address = require('./address.js')(sequelize, DataTypes);
db.Coupon = require('./coupon.js')(sequelize, DataTypes);
db.Order = require('./order.js')(sequelize, DataTypes);
db.Product = require('./product.js')(sequelize, DataTypes);
db.ProductVariation = require('./productvariation.js')(sequelize, DataTypes); // Load ProductVariation before OrderItem
db.OrderItem = require('./orderitem.js')(sequelize, DataTypes); // OrderItem loaded after ProductVariation
db.VariationOption = require('./variationoption.js')(sequelize, DataTypes);
db.ProdVarOpt = require('./prodvaropt.js')(sequelize, DataTypes); // Updated: renamed ProductVariationOption to ProdVarOpt
db.ProductImage = require('./productimage.js')(sequelize, DataTypes);
db.Promotion = require('./promotion.js')(sequelize, DataTypes);
db.Staff = require('./staff.js')(sequelize, DataTypes);
db.Role = require('./role.js')(sequelize, DataTypes);
db.StaffRole = require('./staffrole.js')(sequelize, DataTypes);
db.Category = require('./category.js')(sequelize, DataTypes);
db.Cart = require('./cart.js')(sequelize, DataTypes);
db.CartItem = require('./cartitem.js')(sequelize, DataTypes);
db.Attribute = require('./attribute.js')(sequelize, DataTypes);
db.ProductAttribute = require('./productattribute.js')(sequelize, DataTypes);
db.VariationAttribute = require('./variationattribute.js')(sequelize, DataTypes);



// Define relationships (associations) between models
db.Customer.hasMany(db.Address, { foreignKey: 'customer_id' });
db.Customer.hasMany(db.Order, { foreignKey: 'customer_id' });
db.Customer.hasOne(db.Cart, { foreignKey: 'customer_id' });
db.Address.belongsTo(db.Customer, { foreignKey: 'customer_id' });
db.Address.hasMany(db.Order, { foreignKey: 'shipping_address_id' });
db.Coupon.belongsTo(db.Staff, { as: 'creator', foreignKey: 'created_by' });
db.Coupon.belongsTo(db.Staff, { as: 'updater', foreignKey: 'updated_by' });
db.Coupon.hasMany(db.Order, { foreignKey: 'coupon_id' });
db.Order.belongsTo(db.Customer, { foreignKey: 'customer_id' });
db.Order.belongsTo(db.Coupon, { foreignKey: 'coupon_id' });
db.Order.belongsTo(db.Address, { foreignKey: 'shipping_address_id' });
db.Order.hasMany(db.OrderItem, { foreignKey: 'order_id' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'order_id' });
db.OrderItem.belongsTo(db.Product, { foreignKey: 'product_id' });
db.Product.belongsTo(db.Category, { foreignKey: 'category_id' });
db.Product.hasMany(db.ProductVariation, { foreignKey: 'product_id', as: 'Variations' });
db.Product.hasMany(db.ProductImage, { foreignKey: 'product_id', as: 'images' });
db.Product.hasMany(db.Promotion, { foreignKey: 'product_id', as: 'Promotions' });
db.ProductVariation.belongsTo(db.Product, { foreignKey: 'product_id' });
db.ProductVariation.belongsToMany(db.VariationOption, {
    through: db.ProdVarOpt, // Updated: referencing the renamed ProdVarOpt model
    foreignKey: 'prod_var_id', // Shortened foreign key name
    as: 'Options'
});
db.VariationOption.belongsToMany(db.ProductVariation, {
    through: db.ProdVarOpt, // Updated: referencing the renamed ProdVarOpt model
    foreignKey: 'var_opt_id', // Shortened foreign key name
    as: 'ProductVariations'
});
db.ProductImage.belongsTo(db.Product, { foreignKey: 'product_id' });
db.Promotion.belongsTo(db.Product, { foreignKey: 'product_id' });
db.Staff.belongsTo(db.Staff, { as: 'creator', foreignKey: 'created_by' });
db.Staff.belongsTo(db.Staff, { as: 'updater', foreignKey: 'updated_by' });
db.Staff.hasMany(db.Coupon, { foreignKey: 'created_by' });
db.Staff.hasMany(db.Coupon, { foreignKey: 'updated_by' });
db.Staff.hasMany(db.Role, { foreignKey: 'created_by' });
db.Staff.hasMany(db.Role, { foreignKey: 'updated_by' });
db.Role.belongsTo(db.Staff, { as: 'creator', foreignKey: 'created_by' });
db.Role.belongsTo(db.Staff, { as: 'updater', foreignKey: 'updated_by' });
db.Role.hasMany(db.StaffRole, { foreignKey: 'role_id' });
db.StaffRole.belongsTo(db.Staff, { foreignKey: 'staff_id' });
db.StaffRole.belongsTo(db.Role, { foreignKey: 'role_id' });
db.Category.hasMany(db.Product, { foreignKey: 'category_id' });
db.Category.belongsTo(db.Category, { as: 'parent', foreignKey: 'parent_id' });
db.Category.hasMany(db.Category, { as: 'children', foreignKey: 'parent_id' });
db.Cart.hasMany(db.CartItem, { foreignKey: 'cart_id' });
db.CartItem.belongsTo(db.Cart, { foreignKey: 'cart_id' });
db.CartItem.belongsTo(db.Product, { foreignKey: 'product_id' });
db.CartItem.belongsTo(db.ProductVariation, { foreignKey: 'product_variation_id', allowNull: true });
db.CartItem.belongsTo(db.ProductAttribute, { foreignKey: 'product_attribute_id', allowNull: true });
db.CartItem.belongsTo(db.VariationAttribute, { foreignKey: 'variation_attribute_id', allowNull: true });

// New association: ProductVariation has many OrderItems
db.ProductVariation.hasMany(db.OrderItem, { foreignKey: 'product_variation_id' });

// Attribute associations
db.Attribute.belongsToMany(db.Product, {
    through: db.ProductAttribute,
    foreignKey: 'attribute_id',
    as: 'Products'
});

db.Product.belongsToMany(db.Attribute, {
    through: db.ProductAttribute,
    foreignKey: 'product_id',
    as: 'Attributes'
});

db.Attribute.belongsToMany(db.ProductVariation, {
    through: db.VariationAttribute,
    foreignKey: 'attribute_id',
    as: 'ProductVariations'
});

db.ProductVariation.belongsToMany(db.Attribute, {
    through: db.VariationAttribute,
    foreignKey: 'product_variation_id',
    as: 'Attributes'
});


console.log('ProductVariation associations:', db.ProductVariation.associations);
console.log('VariationAttribute associations:', db.VariationAttribute.associations);

// Export the db object containing all models and Sequelize instance
module.exports = db;
