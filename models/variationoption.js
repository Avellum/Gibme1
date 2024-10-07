module.exports = (sequelize, DataTypes) => {
    const VariationOption = sequelize.define('VariationOption', {
        variation_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['variation_type', 'value']
            }
        ]
    });

    VariationOption.associate = models => {
        VariationOption.belongsToMany(models.ProductVariation, {
            through: 'ProductVariationOption',
            foreignKey: 'variation_option_id',
            as: 'ProductVariations'
        });
    };

    return VariationOption;
};
