import { Router } from 'express';
import { signup, login, updatePassword, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateSignup, validateLogin, validateUpdatePassword } from '../utils/validation';
import { handleValidationErrors } from '../middleware/errorHandler';

const router = Router();

router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.put('/password', authenticate, validateUpdatePassword, handleValidationErrors, updatePassword);
router.get('/profile', authenticate, getProfile);

export default router;