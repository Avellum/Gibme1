module.exports = (sequelize, DataTypes) => {
    const CartItem = sequelize.define('CartItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        cart_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_variation_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        product_attribute_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        variation_attribute_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        tableName: 'cartitems'
    });

    CartItem.associate = models => {
        CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id' });
        CartItem.belongsTo(models.Product, { foreignKey: 'product_id' });
        CartItem.belongsTo(models.ProductVariation, { foreignKey: 'product_variation_id' });

        // Define the association to ProductAttribute using its id as a foreign key
        CartItem.belongsTo(models.ProductAttribute, {
            foreignKey: {
                name: 'product_attribute_id',
                allowNull: true
            },
            as: 'ProductAttribute'
        });

        // Define the association to VariationAttribute using its id as a foreign key
        CartItem.belongsTo(models.VariationAttribute, {
            foreignKey: {
                name: 'variation_attribute_id',
                allowNull: true
            },
            as: 'VariationAttribute'
        });
    };

    return CartItem;
};
