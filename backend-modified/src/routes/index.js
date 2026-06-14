import { Router } from 'express';
import authRoutes from './auth.js';
import postsRoutes from './posts.js';
import searchRoutes from './search.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/search', searchRoutes);

export default router;
