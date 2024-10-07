module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        main_image_url: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    // Define associations
    Product.associate = models => {
        // Association with ProductVariation
        Product.hasMany(models.ProductVariation, {
            foreignKey: 'product_id',
            as: 'Variations'
        });

        // Association with Promotion
        Product.hasMany(models.Promotion, {
            foreignKey: 'product_id',
            as: 'Promotions'
        });

        // Association with ProductImage
        Product.hasMany(models.ProductImage, {
            foreignKey: 'product_id',
            as: 'images'
        });

        // Association with ProductAttribute (attributes tied to products directly)
        Product.belongsToMany(models.Attribute, {
            through: models.ProductAttribute,  // Through ProductAttribute model
            foreignKey: 'product_id',
            as: 'ProductAttributes' // Alias to clearly differentiate from variation attributes
        });
    };

    return Product;
};
