module.exports = (sequelize, DataTypes) => {
  const VariationAttribute = sequelize.define('VariationAttribute', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_variation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attribute_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  }, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'variationattributes',
    indexes: [
      {
        unique: true,
        fields: ['product_variation_id', 'attribute_id']
      }
    ]
  });

  VariationAttribute.associate = function(models) {
    // Belongs to ProductVariation
    VariationAttribute.belongsTo(models.ProductVariation, {
      foreignKey: 'product_variation_id',
      as: 'ProductVariation' // Alias for clarity
    });

    // Belongs to Attribute
    VariationAttribute.belongsTo(models.Attribute, {
      foreignKey: 'attribute_id',
      as: 'Attribute' // Alias for clarity
    });
  };

  return VariationAttribute;
};
