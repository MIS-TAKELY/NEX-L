import dotenv from "dotenv";
import { dbConnect } from "../app/config/dbConnect.js";
import User from "../app/models/user.model.js";

dotenv.config();

async function checkUsers() {
  await dbConnect();
  const users = await User.find({});
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

checkUsers();
