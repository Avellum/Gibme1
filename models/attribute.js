module.exports = (sequelize, DataTypes) => {
    const Attribute = sequelize.define('Attribute', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        attribute_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        attribute_value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Attribute.associate = (models) => {
        // Define relationships with ProductVariation through VariationAttribute
        Attribute.belongsToMany(models.ProductVariation, {
            through: models.VariationAttribute,
            as: 'ProductVariations',
            foreignKey: 'attribute_id',
        });
    };

    return Attribute;
};
