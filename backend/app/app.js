import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth-route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(authRoutes);

export default app;
