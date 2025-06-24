import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      // No token sent, just clear cookies and respond
      res.clearCookie('accessToken', { path: '/' });
      res.clearCookie('refreshToken', { path: '/' });
      return res.json({ success: true, message: 'Logged out successfully' });
    }

    // Hash refresh token to find matching DB record
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Find the refresh token entry to get user ID
    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (storedToken) {
      // Delete all refresh tokens for the user (logout from all devices)
      await prisma.refreshToken.deleteMany({
        where: { userId: storedToken.userId },
      });
    }

    // Clear cookies for access and refresh tokens
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
