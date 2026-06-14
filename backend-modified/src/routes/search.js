import { Router } from 'express';
import * as c from '../controllers/searchController.js';

const router = Router();
router.get('/', c.search);
export default router;
