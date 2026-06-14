export default (sequelize, DataTypes) => {
  const PostVersion = sequelize.define(
    'PostVersion',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      postId: { type: DataTypes.INTEGER, allowNull: false },
      authorId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      excerpt: { type: DataTypes.TEXT, allowNull: true },
      contentJson: { type: DataTypes.JSONB, allowNull: false },
    },
    { tableName: 'post_versions' }
  );

  PostVersion.associate = (models) => {
    PostVersion.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    PostVersion.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
  };

  return PostVersion;
};
