import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("Connect string not available");

    const dbConnectResponse = await mongoose.connect(MONGO_URI);
    console.log("Connected successfully with database");

    if (!dbConnectResponse) throw new Error("Internal Server error");
  } catch (error) {
    console.error(error);
  }
};

