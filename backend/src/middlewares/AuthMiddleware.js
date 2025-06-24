import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decoded.isDisabled) {
      return res.status(403).json({ success: false, message: 'Account is disabled' });
    }

    if (!decoded.isVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role' });
    }

    next();
  };
};

//  USAGE
/*
    router.post(
        '/property',
        requireAuth,            // ✅ checks token, verified email, and not disabled
        requireRole(['LANDLORD']),
        createProperty
    );

 */
