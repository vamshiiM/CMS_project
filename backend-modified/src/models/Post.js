export default (sequelize, DataTypes) => {
  const Post = sequelize.define(
    'Post',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      authorId: { type: DataTypes.INTEGER, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      status: {
        type: DataTypes.ENUM('draft', 'published'),
        allowNull: false,
        defaultValue: 'draft',
      },
      currentVersionId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { tableName: 'posts' }
  );

  Post.associate = (models) => {
    Post.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
    Post.hasMany(models.PostVersion, { foreignKey: 'postId', as: 'versions' });
    Post.belongsTo(models.PostVersion, {
      foreignKey: 'currentVersionId',
      as: 'currentVersion',
      constraints: false,
    });
  };

  return Post;
};
