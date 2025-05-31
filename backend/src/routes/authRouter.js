import express from 'express';
import { register, resendOTP, verifyEmail } from '../controllers/authController.js';
import { signupSchema } from '../validation/signupSchema.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.post('/register', validateRequest(signupSchema), register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);

export default router;
    