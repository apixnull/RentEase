// controllers/auth/getUserInfoController.js
/**
 * Returns basic user info extracted from the access token.
 * Assumes `requireAuth` middleware has verified token and set `req.user`.
 */
const getUserInfoController = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found in request." });
  }

  const { id, email, role, isVerified, isDisabled } = req.user;

  return res.status(200).json({
    user: {
      id,
      email,
      role,
      isVerified,
      isDisabled,
    },
  });
};

export default getUserInfoController;
