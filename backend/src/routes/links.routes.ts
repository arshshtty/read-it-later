import { Router } from 'express';
import { body } from 'express-validator';
import {
  createLink,
  getLinks,
  getLink,
  updateLink,
  deleteLink,
} from '../controllers/links.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes are protected
router.use(authenticate);

router.post(
  '/',
  [
    body('url').isURL(),
    body('categoryId').optional().isString(),
  ],
  createLink
);

router.get('/', getLinks);
router.get('/:id', getLink);

router.patch(
  '/:id',
  [
    body('isRead').optional().isBoolean(),
    body('categoryId').optional().isString(),
  ],
  updateLink
);

router.delete('/:id', deleteLink);

export default router;
