import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

function dotProduct(v1, v2) {
    if (!v1 || !v2 || v1.length !== v2.length) return 0;
    return v1.reduce((acc, current, i) => acc + current * v2[i], 0);
}

function magnitude(v) {
    if (!v) return 0;
    return Math.sqrt(v.reduce((acc, val) => acc + val * val, 0));
}

function cosineSimilarity(v1, v2) {
    const dot = dotProduct(v1, v2);
    const mag1 = magnitude(v1);
    const mag2 = magnitude(v2);
    if (mag1 === 0 || mag2 === 0) return 0;
    return dot / (mag1 * mag2);
}

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const courses = await mongoose.connection.db.collection("courses").find({}).toArray();
  console.log("Total courses in DB:", courses.length);
  
  for (const c of courses) {
    const embLength = c.embedding ? c.embedding.length : 0;
    console.log(`Course: "${c.title}", embedding length: ${embLength}`);
  }
  
  // mock query vector of length 384 with 1s
  const qv = new Array(384).fill(1/Math.sqrt(384));
  
  for (const c of courses) {
      if (c.embedding && c.embedding.length === 384) {
          const sim = cosineSimilarity(qv, c.embedding);
          console.log(`Sim to mock vector for ${c.title}: ${sim}`);
      }
  }
  
  process.exit(0);
}
check();
