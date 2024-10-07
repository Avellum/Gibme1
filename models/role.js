module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        role_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        security_level: {
            type: DataTypes.STRING,
            allowNull: false
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

    Role.associate = models => {
        Role.belongsTo(models.Staff, { as: 'creator', foreignKey: 'created_by' });
        Role.belongsTo(models.Staff, { as: 'updater', foreignKey: 'updated_by' });
        Role.hasMany(models.StaffRole, { foreignKey: 'role_id' });
    };

    return Role;
};
