module.exports = (sequelize, DataTypes) => {
    const StaffRole = sequelize.define('StaffRole', {
        staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true  // Define as part of the composite key
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true  // Define as part of the composite key
        }
    });

    StaffRole.associate = models => {
        StaffRole.belongsTo(models.Staff, { foreignKey: 'staff_id' });
        StaffRole.belongsTo(models.Role, { foreignKey: 'role_id' });
    };

    return StaffRole;
};
