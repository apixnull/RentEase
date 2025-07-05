// middlewares/requireAuth.js

import jwt from 'jsonwebtoken';

const requireAuth = (allowedRoles = ['ANY_ROLE']) => {
  return (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Access token missing.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;

      const { role, isVerified, isDisabled } = decoded;

      if (isDisabled) {
        return res.status(403).json({
          message: 'Account is disabled.',
          errorCode: 'ACCOUNT_DISABLED',
        });
      }

      if (!isVerified) {
        return res.status(403).json({
          message: 'Email not verified.',
          errorCode: 'EMAIL_NOT_VERIFIED',
        });
      }

      if (
        !allowedRoles.includes('ANY_ROLE') &&
        !allowedRoles.includes(role)
      ) {
        return res.status(403).json({ message: 'Unauthorized role access.' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};

export default requireAuth;
