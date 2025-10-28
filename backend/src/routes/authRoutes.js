// file: authRoutes.js
import { Router } from "express";
import { checkAuthStatus, forgotPassword, getUserInfo, login, logout, onboarding, refresh, register, resendVerification, resetPassword, updateProfile, verifyEmail } from "../controllers/AuthController.js";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";

const router = Router();

// ----------------------------------------------------- PROPERTY 
// PUBLIC ROUTES
router.post("/register", register);                                                 // Register user
router.post("/verify-email", verifyEmail);                                          // Verify email
router.post("/resend-verification", resendVerification);                            // Resend verification email
router.post("/forgot-password", forgotPassword);                                    // Send reset email
router.post("/reset-password", resetPassword);                                      // Reset password
router.post("/login", login);                                                       // Login
router.post("/refresh", refresh);                                                   // Refresh tokens 
router.get("/status", checkAuthStatus);                                             // Quick Check if user is login

// PRIVATE ROUTES 
router.get("/me", requireAuthentication(["ANY_ROLE"]), getUserInfo);                // Get current user 
router.put("/onboarding", requireAuthentication(["ANY_ROLE"]), onboarding)          // Onboarding User 
router.put("/update-profile", requireAuthentication(["ANY_ROLE"]), updateProfile)   // Update User 
router.post("/logout", logout);                                                     // Logout, clear cookies

export default router;
