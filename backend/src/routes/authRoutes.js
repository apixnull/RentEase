// file: authRoutes.js
import { Router } from "express";
import { forgotPassword, getUserInfo, login, logout, onboarding, refresh, register, resendVerification, resetPassword, verifyEmail } from "../controllers/AuthController.js";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";

const router = Router();

// Auth routes
router.post("/register", register);                  // Register user
router.post("/verify-email", verifyEmail);               // Verify email
router.post("/resend-verification", resendVerification);       // Resend verification email

router.post("/forgot-password", forgotPassword);           // Send reset email
router.post("/reset-password", resetPassword);            // Reset password

router.post("/login", login);                     // Login, set JWT cookies
router.post("/refresh", refresh);                       // Refresh tokens (public, uses refresh token cookie)

router.get("/me",requireAuthentication(["ANY_ROLE"]) ,getUserInfo);                         // Get current user (protected)
router.put("/onboarding", requireAuthentication(["ANY_ROLE"]), onboarding)                  // Onboarding User (protected)

router.post("/logout",  requireAuthentication(["ANY_ROLE"]), logout);                    // Logout, clear cookies

export default router;
