module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        order_status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending'  // Default status for a new order
        },
        approved_state: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false  // Default to not approved
        },
        time_approved: {
            type: DataTypes.DATE,
            allowNull: true
        },
        coupon_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Coupons',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        },
        shipping_address_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Addresses',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        shipping_charge: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        estimated_days: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Order.associate = models => {
        Order.belongsTo(models.Customer, { foreignKey: 'customer_id' });
        Order.belongsTo(models.Coupon, { foreignKey: 'coupon_id' });
        Order.belongsTo(models.Address, { foreignKey: 'shipping_address_id' });
        Order.hasMany(models.OrderItem, { foreignKey: 'order_id' });
    };

    return Order;
};
