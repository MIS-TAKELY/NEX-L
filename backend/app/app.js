import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth.js";
<<<<<<< HEAD
import routes from "./routes/index.js";
=======
// import routes from "./routes/index.js";

import { toNodeHandler } from "better-auth/node";
>>>>>>> prashikshya

import { toNodeHandler } from "better-auth/node";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || true, // fallback to true (reflect origin) or a default URL
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));

// Error logger
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(500).send("Internal Server Error");
});

// other APIs
<<<<<<< HEAD
app.use("/api/v1", routes);
=======
// app.use("/api/v1", routes);
>>>>>>> prashikshya

export default app;
