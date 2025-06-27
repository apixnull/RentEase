import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // 2. Check password match
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // 3. Check verification and disabled flags
    if (!user.isVerified)
      return res.status(403).json({ success: false, message: 'Email not verified' });
    if (user.isDisabled)
      return res.status(403).json({ success: false, message: 'Account disabled' });

    // 4. Generate tokens
    const accessToken = signAccessToken(user);
    const { token: refreshToken, hash: refreshTokenHash } = generateRefreshToken();

    // 5. Store hashed refresh token in DB with 1 day expiry
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      },
    });

    // 6. Cookie options shared between access and refresh tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    };

    // 7. Set access token cookie - expires in 1 hour
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hour in ms
    });

    // 8. Set refresh token cookie - expires in 1 day
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
    });

    // 9. Send response without tokens in body (in cookies now)
    return res.json({
      success: true,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Helper to sign JWT access token with 1 hour expiry
function signAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isDisabled: user.isDisabled,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' } // 1 hour
  );
}

// Helper to generate refresh token (random + hashed)
function generateRefreshToken() {
  const token = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}
