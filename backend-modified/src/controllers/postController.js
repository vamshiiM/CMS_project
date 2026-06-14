import { Post, PostVersion, User, sequelize } from '../models/index.js';
import { uniqueSlug } from '../utils/slug.js';
import { diffTiptap } from '../services/diffService.js';

const versionInclude = { model: PostVersion, as: 'currentVersion' };
const authorInclude = { model: User, as: 'author', attributes: ['id', 'name', 'email'] };

export const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { title, excerpt, contentJson } = req.body;
    const slug = await uniqueSlug(title);
    const post = await Post.create(
      { authorId: req.user.id, slug, status: 'draft', currentVersionId: null },
      { transaction: t }
    );
    const version = await PostVersion.create(
      { postId: post.id, authorId: req.user.id, title, excerpt, contentJson },
      { transaction: t }
    );
    post.currentVersionId = version.id;
    await post.save({ transaction: t });
    await t.commit();
    res.status(201).json({ post, version });
  } catch (e) { await t.rollback(); next(e); }
};

export const update = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { title, excerpt, contentJson } = req.body;
    const post = await Post.findByPk(req.params.id, { transaction: t });
    if (!post) { await t.rollback(); return res.status(404).json({ message: 'Post not found' }); }
    if (post.authorId !== req.user.id) { await t.rollback(); return res.status(403).json({ message: 'Forbidden' }); }
    const version = await PostVersion.create(
      { postId: post.id, authorId: req.user.id, title, excerpt, contentJson },
      { transaction: t }
    );
    post.currentVersionId = version.id;
    await post.save({ transaction: t });
    await t.commit();
    res.json({ post, version });
  } catch (e) { await t.rollback(); next(e); }
};

export const getBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: { slug: req.params.slug },
      include: [versionInclude, authorInclude],
    });
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.status !== 'published') {
      if (!req.user || req.user.id !== post.authorId)
        return res.status(404).json({ message: 'Not found' });
    }
    res.json({ post });
  } catch (e) { next(e); }
};

export const myPosts = async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      where: { authorId: req.user.id },
      include: [versionInclude],
      order: [['updatedAt', 'DESC']],
    });
    res.json({ posts });
  } catch (e) { next(e); }
};

export const listPublished = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, parseInt(req.query.limit || '10', 10));
    const { rows, count } = await Post.findAndCountAll({
      where: { status: 'published' },
      include: [versionInclude, authorInclude],
      order: [['updatedAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });
    res.json({ posts: rows, total: count, page, limit });
  } catch (e) { next(e); }
};

export const publish = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    post.status = 'published';
    await post.save();
    res.json({ post });
  } catch (e) { next(e); }
};

export const unpublish = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    post.status = 'draft';
    await post.save();
    res.json({ post });
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    post.currentVersionId = null;
    await post.save();
    await PostVersion.destroy({ where: { postId: post.id } });
    await post.destroy();
    res.json({ ok: true });
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [versionInclude, authorInclude],
    });
    if (!post) return res.status(404).json({ message: 'Not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.json({ post });
  } catch (e) { next(e); }
};

export const diff = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    const from = await PostVersion.findOne({ where: { id: req.query.from, postId: post.id } });
    const to = await PostVersion.findOne({ where: { id: req.query.to, postId: post.id } });
    if (!from || !to) return res.status(404).json({ message: 'Version not found' });
    if (post.authorId !== req.user.id && post.status !== 'published') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const segments = diffTiptap(from.contentJson, to.contentJson);
    res.json({ from: { id: from.id, title: from.title }, to: { id: to.id, title: to.title }, segments });
  } catch (e) { next(e); }
};
