import { Post, PostVersion, User, sequelize } from '../models/index.js';

export const list = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const versions = await PostVersion.findAll({
      where: { postId: post.id },
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ versions, currentVersionId: post.currentVersionId });
  } catch (e) { next(e); }
};

export const getOne = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const version = await PostVersion.findOne({
      where: { id: req.params.versionId, postId: post.id },
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'email'] }],
    });
    if (!version) return res.status(404).json({ message: 'Version not found' });
    res.json({ version });
  } catch (e) { next(e); }
};

export const restore = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const post = await Post.findByPk(req.params.id, { transaction: t });
    if (!post) { await t.rollback(); return res.status(404).json({ message: 'Not found' }); }
    if (post.authorId !== req.user.id) { await t.rollback(); return res.status(403).json({ message: 'Forbidden' }); }
    const src = await PostVersion.findOne({
      where: { id: req.params.versionId, postId: post.id },
      transaction: t,
    });
    if (!src) { await t.rollback(); return res.status(404).json({ message: 'Version not found' }); }
    const copy = await PostVersion.create(
      {
        postId: post.id,
        authorId: req.user.id,
        title: src.title,
        excerpt: src.excerpt,
        contentJson: src.contentJson,
      },
      { transaction: t }
    );
    post.currentVersionId = copy.id;
    await post.save({ transaction: t });
    await t.commit();
    res.status(201).json({ version: copy });
  } catch (e) { await t.rollback(); next(e); }
};
