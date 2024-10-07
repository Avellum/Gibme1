module.exports = (sequelize, DataTypes) => {
    const ProductImage = sequelize.define('ProductImage', {
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    ProductImage.associate = models => {
        ProductImage.belongsTo(models.Product, { foreignKey: 'product_id' });
    };

    return ProductImage;
};
