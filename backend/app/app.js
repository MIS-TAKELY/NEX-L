import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth.js";
import routes from "./routes/index.js";
import { toNodeHandler } from "better-auth/node";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// auth
app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));

// APIs
app.use("/api/v1", routes);

// error handler (keep LAST)
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
