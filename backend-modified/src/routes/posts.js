import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validateRequest.js';
import auth from '../middlewares/auth.js';
import * as posts from '../controllers/postController.js';
import * as versions from '../controllers/versionController.js';

const router = Router();

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) return auth(req, res, next);
  next();
};

const writeValidators = [
  body('title').isString().notEmpty(),
  body('excerpt').optional({ nullable: true }).isString(),
  body('contentJson').custom((v) => v && typeof v === 'object').withMessage('contentJson must be JSON'),
  validate,
];

// Order: specific routes BEFORE param routes
router.get('/me', auth, posts.myPosts);
router.get('/', posts.listPublished);

router.post('/', auth, writeValidators, posts.create);
router.put('/:id', auth, writeValidators, posts.update);
router.delete('/:id', auth, posts.remove);
router.patch('/:id/publish', auth, posts.publish);
router.patch('/:id/unpublish', auth, posts.unpublish);

router.get('/id/:id', auth, posts.getById);

// Versions
router.get('/:id/versions', auth, versions.list);
router.get('/:id/versions/:versionId', auth, versions.getOne);
router.post('/:id/restore/:versionId', auth, versions.restore);
router.get('/:id/diff', auth, posts.diff);

// Public by slug (last, since :slug would otherwise swallow other paths)
router.get('/:slug', optionalAuth, posts.getBySlug);

export default router;
