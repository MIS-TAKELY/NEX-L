import dotenv from "dotenv";
dotenv.config();

import { dbConnect } from "./app/config/dbConnect.js";

async function startServer() {
  try {
    await dbConnect();

    // Dynamically import app so it can use the initialized DB client
    const { default: app } = await import("./app/app.js");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is live on PORT:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
