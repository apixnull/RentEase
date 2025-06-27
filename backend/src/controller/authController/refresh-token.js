import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

const REFRESH_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 day in ms
const ACCESS_TOKEN_EXPIRY = '30m'; // 30 minutes

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(403).json({ success: false, message: 'Refresh token missing' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = storedToken.user;

    // Generate new access token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isDisabled: user.isDisabled,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // Generate new refresh token and hash
    const { token: newRefreshToken, hash: newRefreshTokenHash } = generateRefreshToken();

    // Transaction: revoke old refresh token, create new one with fresh expiry
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newRefreshTokenHash,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        },
      }),
    ]);

    // Common secure cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    };

    // Set new cookies with fresh expiry
    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

function generateRefreshToken() {
  const token = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}
