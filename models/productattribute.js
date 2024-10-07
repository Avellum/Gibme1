module.exports = (sequelize, DataTypes) => {
    const ProductAttribute = sequelize.define('ProductAttribute', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        attribute_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'productattributes',
        indexes: [
            {
                unique: true,
                fields: ['product_id', 'attribute_id']
            }
        ]
    });

    ProductAttribute.associate = function(models) {
        ProductAttribute.belongsTo(models.Product, { foreignKey: 'product_id' });
        ProductAttribute.belongsTo(models.Attribute, { foreignKey: 'attribute_id' });
    };

    return ProductAttribute;
};
