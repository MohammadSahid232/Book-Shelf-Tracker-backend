/**
 * isAdmin middleware
 * Must be used AFTER verifyToken.
 * Blocks access if the authenticated user is not an admin.
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access Denied: Admin only.' });
  }
  next();
};

module.exports = isAdmin;
