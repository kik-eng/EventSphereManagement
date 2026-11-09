// Use after `protect` (adminMiddleware.js) - req.user = { id, role }
const exhibitorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'exhibitor') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied. Exhibitor account required.' });
};

module.exports = { exhibitorOnly };