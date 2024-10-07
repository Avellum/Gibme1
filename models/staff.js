module.exports = (sequelize, DataTypes) => {
    const Staff = sequelize.define('Staff', {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profile_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Staff.associate = models => {
        Staff.belongsTo(models.Staff, { as: 'creator', foreignKey: 'created_by' });
        Staff.belongsTo(models.Staff, { as: 'updater', foreignKey: 'updated_by' });
        Staff.hasMany(models.Coupon, { foreignKey: 'created_by' });
        Staff.hasMany(models.Coupon, { foreignKey: 'updated_by' });
        Staff.hasMany(models.Role, { foreignKey: 'created_by' });
        Staff.hasMany(models.Role, { foreignKey: 'updated_by' });
    };

    return Staff;
};
