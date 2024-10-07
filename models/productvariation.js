module.exports = (sequelize, DataTypes) => {
  const ProductVariation = sequelize.define('ProductVariation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    tableName: 'productvariations'
  });

  ProductVariation.associate = models => {
    // Associate with Product
    ProductVariation.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'Product' // Optional alias, useful in case of joins
    });

    // Associate with VariationOption model through ProdVarOpt (renamed from ProductVariationOption)
    ProductVariation.belongsToMany(models.VariationOption, {
      through: models.ProdVarOpt, // Updated to reference the renamed model
      foreignKey: 'product_variation_id',
      as: 'Options' // Alias for accessing the options associated with the variation
    });

    // Associate with OrderItem
    ProductVariation.hasMany(models.OrderItem, {
      foreignKey: 'product_variation_id',
      as: 'OrderItems' // Alias for order items
    });

    // Direct association between ProductVariation and VariationAttribute
    ProductVariation.hasMany(models.VariationAttribute, {
      foreignKey: 'product_variation_id',
      as: 'VariationAttributes' // Alias for accessing VariationAttributes directly
    });
  };

  return ProductVariation;
};
