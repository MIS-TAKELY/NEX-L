import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import getEmbedding from "./app/utils/embedding.js";

// We need to import the schema directly to avoid circular dependency issues sometimes
import Course from "./app/models/course.model.js";

const CATEGORY_ALIASES = new Map([
  ["web development", "Development"],
  ["mobile development", "Development"],
  ["data science", "Development"],
  ["programming", "Development"],
  ["coding", "Development"],
  ["software development", "Development"],
  ["frontend", "Development"],
  ["backend", "Development"],
  ["development", "Development"],
  ["business", "Business"],
  ["marketing", "Marketing"],
  ["design", "Design"],
]);

const normalizeCategory = (value) => {
  if (!value) return "";
  const raw = String(value).trim();
  return CATEGORY_ALIASES.get(raw.toLowerCase()) || raw;
};

const buildEmbeddingText = (course) =>
  `${course.title || ""} ${course.description || ""} ${normalizeCategory(course.category) || ""} ${course.level || ""} ${Array.isArray(course.tags) ? course.tags.join(" ") : ""}`.trim();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/nex-l");
    console.log("Connected to database. Fetching courses...");

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses to embed.`);

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const textToEmbed = buildEmbeddingText(course);
      
      console.log(`[${i+1}/${courses.length}] Embedding course: "${course.title}"`);
      
      if (textToEmbed) {
        try {
          let embedding = await getEmbedding(textToEmbed);
          // Ensure flat array
          if (Array.isArray(embedding[0])) {
             embedding = embedding[0];
          }
          
          course.embedding = embedding;
          await course.save();
          console.log(`Successfully updated embedding for: ${course.title} (Length: ${embedding.length})`);
        } catch (embedErr) {
          console.error(`Failed to generate embedding for ${course.title}:`, embedErr.message);
        }
      } else {
        console.log(`Skipping ${course.title} - no text to embed.`);
      }
    }

    console.log("Finished embedding all courses.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database.");
  }
}

run();
