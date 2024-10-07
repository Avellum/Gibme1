module.exports = (sequelize, DataTypes) => {
    const ProdVarOpt = sequelize.define('ProdVarOpt', {
        prod_var_id: { // Shortened the foreign key column name
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'productvariations',
                key: 'id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }
        },
        var_opt_id: { // Shortened the foreign key column name
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'VariationOptions',
                key: 'id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            }
        }
    }, {
        timestamps: false,
        tableName: 'ProdVarOpts', // Shortened table name
        indexes: [
            {
                unique: true,
                name: 'prod_var_var_opt_unique', // A short but descriptive index name
                fields: ['prod_var_id', 'var_opt_id'] // Reflects the new shortened column names
            }
        ]
    });

    return ProdVarOpt; // Shortened return value for consistency
};
