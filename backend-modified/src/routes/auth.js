import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middlewares/validateRequest.js';
import auth from '../middlewares/auth.js';
import * as c from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validate,
  c.register
);

router.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({ min: 1 }),
  validate,
  c.login
);

router.get('/me', auth, c.me);

export default router;
