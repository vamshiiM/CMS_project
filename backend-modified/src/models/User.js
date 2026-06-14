export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: 'users' }
  );

  User.associate = (models) => {
    User.hasMany(models.Post, { foreignKey: 'authorId', as: 'posts' });
    User.hasMany(models.PostVersion, { foreignKey: 'authorId', as: 'versions' });
  };

  return User;
};
