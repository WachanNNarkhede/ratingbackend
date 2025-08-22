import { Router } from 'express';
import { submitRating, getUserRatings } from '../controllers/ratingController';
import {getUsers} from '../controllers/adminController'
import {getAllStores,getDashboardStats} from '../controllers/adminController'
import {createUser} from '../controllers/adminController'
import { authenticate, authorize } from '../middleware/auth';
import { validateRating } from '../utils/validation';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), validateRating, handleValidationErrors, submitRating);
router.get('/dashboard', authenticate, authorize('ADMIN'), getUserRatings);
router.get('/users', authenticate, authorize('ADMIN'), getUsers);

router.post('/users', authenticate, authorize('ADMIN'), createUser);
router.get('/stores', authenticate, authorize('ADMIN'), getAllStores);
router.get('/dashboard', authenticate, authorize('ADMIN'), getDashboardStats);


export default router;
