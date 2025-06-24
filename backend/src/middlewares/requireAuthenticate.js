// middlewares/requireAuthenticate.js
import jwt from "jsonwebtoken";

export const requireAuthenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // attach decoded user payload to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired access token" });
  }
};
