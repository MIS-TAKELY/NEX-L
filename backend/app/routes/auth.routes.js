// app/routes/auth.routes.js
import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  const { role } = req.query;
  if (role) {
    res.cookie("pending_role", role, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 3600000,
    });
  }
  res.status(200).send({ success: true, role });
});
//tes
export default router;
