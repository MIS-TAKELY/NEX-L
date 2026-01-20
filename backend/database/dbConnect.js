import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("Connect string not avilable");
    // console.log("connection strong-->", MONGO_URI);
    const dbConnectResposne = await mongoose.connect(MONGO_URI);
    console.log("connected successfully with databse");
    if (!dbConnectResposne) throw new Error("Internal Server error");
  } catch (error) {
    console.error(error);
  }
};
