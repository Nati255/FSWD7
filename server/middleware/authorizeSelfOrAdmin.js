export function authorizeSelfOrAdmin(paramKey = 'userId') {
  return (req, res, next) => {
    const userIdFromToken = req.user?.id;
    const userIdFromParams = parseInt(req.params[paramKey]);

    if (
      req.user?.role === 'admin' ||
      userIdFromToken === userIdFromParams
    ) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied: unauthorized' });
  };
}
