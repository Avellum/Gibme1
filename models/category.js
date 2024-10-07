module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        timestamps: false // Disable timestamps
    });

    Category.associate = models => {
        Category.hasMany(models.Product, { foreignKey: 'category_id' });
        Category.belongsTo(models.Category, { as: 'parent', foreignKey: 'parent_id' });
        Category.hasMany(models.Category, { as: 'children', foreignKey: 'parent_id' });
    };

    return Category;
};
