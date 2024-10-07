module.exports = (sequelize, DataTypes) => {
    const Promotion = sequelize.define('Promotion', {
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        discount_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false
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
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Promotion.associate = models => {
        Promotion.belongsTo(models.Product, { foreignKey: 'product_id' });
    };

    return Promotion;
};
