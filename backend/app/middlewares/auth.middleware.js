import { auth } from "../auth/betterAuth";

export const requireAuth = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = session.user;
  next();
};
