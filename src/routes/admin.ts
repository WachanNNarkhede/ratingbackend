import { Router } from 'express';
import { submitRating, getUserRatings } from '../controllers/ratingController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRating } from '../utils/validation';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

router.post('/', authenticate, authorize('NORMAL_USER'), validateRating, handleValidationErrors, submitRating);
router.get('/my-ratings', authenticate, authorize('NORMAL_USER'), getUserRatings);

export default router;