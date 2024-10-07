module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        profile_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    });

    Customer.associate = models => {
        Customer.hasMany(models.Address, { foreignKey: 'customer_id' });
        Customer.hasMany(models.Order, { foreignKey: 'customer_id' });
        Customer.hasOne(models.Cart, { foreignKey: 'customer_id' });
    };

    Customer.afterCreate(async (customer, options) => {
        await sequelize.models.Cart.create({ customer_id: customer.id });
    });

    return Customer;
};
