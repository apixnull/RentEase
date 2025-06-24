import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Constants for refresh token expiry and rotation threshold
const REFRESH_TOKEN_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes in milliseconds
const REFRESH_TOKEN_ROTATE_THRESHOLD_MS = 1 * 60 * 1000; // 1 minute in milliseconds (rotate if less than 1 min left)

export const refreshToken = async (req, res) => {
  try {
    // Extract refresh token from cookies
    const token = req.cookies.refreshToken;
    if (!token) {
      // No refresh token found in request
      return res.status(403).json({ success: false, message: 'Refresh token missing' });
    }

    // Hash the incoming token to compare securely with the stored hashed token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find the stored refresh token record in DB, including the associated user
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // Validate token existence, revocation status, and expiry
    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = storedToken.user;

    // Calculate how much time remains before refresh token expires
    const timeLeft = storedToken.expiresAt.getTime() - Date.now();

    // Always generate a new access token (short-lived JWT)
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isDisabled: user.isDisabled,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1m' } // Access token valid for 1 minute (adjust as needed)
    );

    // Common cookie options for security
    const commonCookieOptions = {
      httpOnly: true,                        // Prevent JS access (mitigates XSS)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',                    // CSRF protection by restricting cross-site requests
      path: '/',                            // Send cookie on all routes
    };

    if (timeLeft > REFRESH_TOKEN_ROTATE_THRESHOLD_MS) {
      // If the refresh token is still valid for more than threshold (1 minute),
      // don't rotate it, just send back new access token and keep the same refresh token cookie
      res.cookie('accessToken', accessToken, {
        ...commonCookieOptions,
        maxAge: 60 * 1000, // 1 minute in milliseconds
      });

      return res.json({ success: true });
    }

    // Refresh token is close to expiry — rotate it by:
    // 1. Creating a new refresh token
    // 2. Revoking the old one in a transaction to ensure atomicity
    const { token: newRefreshToken, hash: newRefreshTokenHash } = generateRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },  // Mark old token as revoked
      }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newRefreshTokenHash,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS), // Set new expiry 2 minutes from now
        },
      }),
    ]);

    // Set new refresh token cookie and new access token cookie
    res.cookie('refreshToken', newRefreshToken, {
      ...commonCookieOptions,
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });

    res.cookie('accessToken', accessToken, {
      ...commonCookieOptions,
      maxAge: 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Helper function to generate a new refresh token (random + hashed)
function generateRefreshToken() {
  const token = crypto.randomBytes(64).toString('hex');        // Generate a 64-byte random token string
  const hash = crypto.createHash('sha256').update(token).digest('hex'); // Hash token for secure storage
  return { token, hash };
}
