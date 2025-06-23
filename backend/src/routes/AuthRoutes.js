import { Router } from 'express';
import { register, verifyToken } from '../controller/authController/register.js';
import { verifyEmail } from '../controller/authController/verifyEmail.js';
import { resendOtp } from '../controller/authController/resend-otp.js';

const router = Router();

router.post('/register', register);
router.post('/verify-token', verifyToken);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);

export default router;
