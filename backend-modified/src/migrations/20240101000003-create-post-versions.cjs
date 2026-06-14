'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('post_versions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'posts', key: 'id' },
        onDelete: 'CASCADE',
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      excerpt: { type: Sequelize.TEXT, allowNull: true },
      contentJson: { type: Sequelize.JSONB, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('post_versions', ['postId']);

    await queryInterface.addConstraint('posts', {
      fields: ['currentVersionId'],
      type: 'foreign key',
      name: 'posts_current_version_fk',
      references: { table: 'post_versions', field: 'id' },
      onDelete: 'SET NULL',
    });

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS post_versions_fts_idx
      ON post_versions
      USING gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce("contentJson"::text,'')));
    `);
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('posts', 'posts_current_version_fk').catch(() => {});
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS post_versions_fts_idx;');
    await queryInterface.dropTable('post_versions');
  },
};
