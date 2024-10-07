module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Orders',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        product_variation_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'ProductVariations',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        attribute_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Attributes',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    OrderItem.associate = models => {
        OrderItem.belongsTo(models.Order, { foreignKey: 'order_id' });
        OrderItem.belongsTo(models.Product, { foreignKey: 'product_id' });
        OrderItem.belongsTo(models.ProductVariation, { foreignKey: 'product_variation_id' });
        OrderItem.belongsTo(models.Attribute, { foreignKey: 'attribute_id' });
    };

    return OrderItem;
};
