import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is live on PORT prashiksya:${PORT}`);
});
