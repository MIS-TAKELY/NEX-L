import { auth as authLib } from "../lib/auth.js";

export const requireAuth = async (req, res, next) => {
  const session = await authLib.api.getSession({ headers: req.headers });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = session.user;
  next();
};

// Middleware to require specific role(s)
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    const session = await authLib.api.getSession({ headers: req.headers });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = session.user.role || "student";

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: Insufficient permissions",
        requiredRole: allowedRoles,
        userRole: userRole
      });
    }

    req.user = session.user;
    next();
  };
};

// Aliases for better ergonomics in route files
export const auth = requireAuth;
export const authorize = requireRole;
