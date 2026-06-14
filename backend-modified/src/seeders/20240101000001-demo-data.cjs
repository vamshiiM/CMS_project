'use strict';

const bcrypt = require('bcryptjs');
const slugify = require('slugify');

function doc(text) {
  return {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text }] },
      { type: 'paragraph', content: [{ type: 'text', text: `${text} - body paragraph with some content.` }] },
    ],
  };
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [
      { name: 'Author One', email: 'author1@example.com', passwordHash, createdAt: now, updatedAt: now },
      { name: 'Author Two', email: 'author2@example.com', passwordHash, createdAt: now, updatedAt: now },
    ]);

    const [users] = await queryInterface.sequelize.query(`SELECT id, email FROM users ORDER BY id ASC;`);
    const a1 = users.find((u) => u.email === 'author1@example.com').id;
    const a2 = users.find((u) => u.email === 'author2@example.com').id;

    const postsSpec = [
      { title: 'Welcome to the CMS', status: 'published', authorId: a1, versions: 3 },
      { title: 'Draft Ideas', status: 'draft', authorId: a1, versions: 1 },
      { title: 'Getting Started Guide', status: 'published', authorId: a2, versions: 1 },
      { title: 'Roadmap Notes', status: 'draft', authorId: a2, versions: 1 },
      { title: 'Release Announcement', status: 'published', authorId: a1, versions: 1 },
    ];

    for (const p of postsSpec) {
      const slug = slugify(p.title, { lower: true, strict: true });
      await queryInterface.bulkInsert('posts', [
        { authorId: p.authorId, slug, status: p.status, currentVersionId: null, createdAt: now, updatedAt: now },
      ]);
      const [[post]] = await queryInterface.sequelize.query(`SELECT id FROM posts WHERE slug = '${slug}' LIMIT 1;`);
      let lastVersionId = null;
      for (let i = 1; i <= p.versions; i++) {
        const title = i === p.versions ? p.title : `${p.title} (v${i})`;
        const contentJson = doc(`${p.title} — version ${i}`);
        await queryInterface.bulkInsert('post_versions', [
          {
            postId: post.id,
            authorId: p.authorId,
            title,
            excerpt: `${p.title} excerpt v${i}`,
            contentJson: JSON.stringify(contentJson),
            createdAt: now,
            updatedAt: now,
          },
        ]);
        const [[ver]] = await queryInterface.sequelize.query(
          `SELECT id FROM post_versions WHERE "postId" = ${post.id} ORDER BY id DESC LIMIT 1;`
        );
        lastVersionId = ver.id;
      }
      await queryInterface.sequelize.query(
        `UPDATE posts SET "currentVersionId" = ${lastVersionId} WHERE id = ${post.id};`
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('UPDATE posts SET "currentVersionId" = NULL;');
    await queryInterface.bulkDelete('post_versions', null, {});
    await queryInterface.bulkDelete('posts', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
