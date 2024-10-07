module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define('Cart', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: true, // This remains true to allow guest carts without customer IDs
        },
        session_id: {
            type: DataTypes.STRING, // Store session ID for guests
            allowNull: true, // This can be null for authenticated users
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Cart.associate = models => {
        Cart.belongsTo(models.Customer, { foreignKey: 'customer_id', allowNull: true });
        Cart.hasMany(models.CartItem, { foreignKey: 'cart_id' });
    };

    return Cart;
};
