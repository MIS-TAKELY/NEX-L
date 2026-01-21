import dotenv from "dotenv";
import express from "express";
import { dbConnect } from "./database/dbConnect.js";

dotenv.config();

dbConnect();

const app = express();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is live on PORT:${PORT}`);
});
