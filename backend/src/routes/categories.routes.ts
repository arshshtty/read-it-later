import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(authenticate);

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('color').optional().isString(),
  ],
  createCategory
);

router.get('/', getCategories);

router.patch(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('color').optional().isString(),
  ],
  updateCategory
);

router.delete('/:id', deleteCategory);

export default router;
