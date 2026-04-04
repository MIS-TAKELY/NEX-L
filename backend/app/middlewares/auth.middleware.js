import { auth as authLib } from "../lib/auth.js";
import { parseRolesFromUser } from "../lib/roles.js";

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

    const userRoles = parseRolesFromUser(session.user);
    const allowed = userRoles.some((r) => allowedRoles.includes(r));

    if (!allowed) {
      return res.status(403).json({
        message: "Forbidden: Insufficient permissions",
        requiredRole: allowedRoles,
        userRoles,
      });
    }

    req.user = session.user;
    next();
  };
};

// Aliases for better ergonomics in route files
export const auth = requireAuth;
export const authorize = requireRole;
