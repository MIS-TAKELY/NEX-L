import mongoose from "mongoose";
import dotenv from "dotenv";
import getEmbedding from "./app/utils/embedding.js";
import { cosineSimilarity } from "./app/utils/vector-utils.js";
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const courses = await mongoose.connection.db.collection("courses").find({}).toArray();
  
  const queryVector = await getEmbedding("python");
  console.log("Query vector length:", queryVector.length);
  
  for (const c of courses) {
      if (c.embedding && c.embedding.length === 384) {
          const sim = cosineSimilarity(queryVector, c.embedding);
          console.log(`Sim to "python" for ${c.title}: ${sim}`);
      }
  }
  
  process.exit(0);
}
check();
