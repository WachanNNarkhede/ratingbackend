import { Router } from 'express';
import { getStores, createStore, getStoreDetails, getMyStore } from '../controllers/storeController';
import { authenticate, authorize } from '../middleware/auth';
import { validateCreateStore } from '../utils/validation';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

router.get('/', authenticate, getStores);
router.post('/', authenticate, authorize('ADMIN'), validateCreateStore, handleValidationErrors, createStore);
router.get('/my-store', authenticate, authorize('STORE_OWNER'), getMyStore);
// router.get('/:id', authenticate, getStoreDetails);

export default router;