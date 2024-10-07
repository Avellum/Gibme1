module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        address_line1: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address_line2: {
            type: DataTypes.STRING,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        postal_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address_type: {
            type: DataTypes.ENUM('shipping', 'billing'),
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Address.associate = models => {
        Address.belongsTo(models.Customer, { foreignKey: 'customer_id' });
        Address.hasMany(models.Order, { foreignKey: 'shipping_address_id' });
    };

    return Address;
};
