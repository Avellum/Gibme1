module.exports = (sequelize, DataTypes) => {
    const Coupon = sequelize.define('Coupon', {
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'flat'),
            allowNull: false
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        max_usage: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        times_used: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Coupon.associate = models => {
        Coupon.belongsTo(models.Staff, { as: 'creator', foreignKey: 'created_by' });
        Coupon.belongsTo(models.Staff, { as: 'updater', foreignKey: 'updated_by' });
    };

    return Coupon;
};
