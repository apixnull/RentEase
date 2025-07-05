// routes/authRoutes.js
import { Router } from 'express';
import registerController from '../controllers/auth/registerController.js';
import verifyEmailController from '../controllers/auth/verifyEmailController.js';
import resendOtpController from '../controllers/auth/resendOtpController.js';
import  registerValidation  from '../middlewares/validations/auth/registerValidation.js';
import requireAuth  from '../middlewares/requireAuth.js';
import loginController from '../controllers/auth/loginController.js';
import refreshTokenController from '../controllers/auth/refreshTokenController.js';
import logoutController from '../controllers/auth/logoutController.js';
import { authLimiter, refreshLimiter } from '../middlewares/rateLimiter.js';
import getUserInfoController from '../controllers/auth/getUserInfoController.js';
import forgotPasswordController from '../controllers/auth/forgotPasswordController.js';
import resetPasswordController from '../controllers/auth/resetPasswordController.js';

const router = Router();


router.post('/register', authLimiter, registerValidation, registerController);
router.post('/verify-email', authLimiter, verifyEmailController);
router.post('/resend-otp', authLimiter, resendOtpController);

router.post('/forget-password', authLimiter, forgotPasswordController);
router.post('/reset-password', authLimiter, resetPasswordController); // 👈 added here

router.post('/login', authLimiter, loginController);
router.post('/refresh-token', refreshLimiter, refreshTokenController); 
router.get('/get-user-info', authLimiter, requireAuth(['ANY_ROLE']) , getUserInfoController); 

router.post('/logout', logoutController);

export default router;
 