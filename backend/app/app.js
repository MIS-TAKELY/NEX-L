import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth-route.js";
import routes from "./routes/index.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1",routes)

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(authRoutes);

export default app;
