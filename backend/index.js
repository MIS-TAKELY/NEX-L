import dotenv from "dotenv";
import { dbConnect } from "./app/database/dbConnect.js";

dotenv.config();

import app from "./app/app.js";
dbConnect();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is live on PORT:${PORT}`);
});
