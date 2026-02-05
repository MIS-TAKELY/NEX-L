import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error("Error: HF_TOKEN is not set in .env file");
  process.exit(1);
}

if (typeof HF_TOKEN !== "string" || !HF_TOKEN.startsWith("hf_")) {
  console.error(
    "Error: HF_TOKEN does not look like a valid Hugging Face token",
  );
  process.exit(1);
}

const client = new InferenceClient(HF_TOKEN);

console.log("Client initialized successfully");

async function getEmbedding(text) {
  try {
    console.log("Generating embedding for:", text);

    const output = await client.featureExtraction({
      model: "Qwen/Qwen3-Embedding-8B",
      inputs: text,
    });

    console.log("Embedding generated successfully");
    console.log("Output length:", output.length);

    // Flatten to ensure it's a 1D array of numbers.
    const flatEmbedding = Array.isArray(output[0]) ? output[0] : output;

    return flatEmbedding;
  } catch (err) {
    console.error("Embedding error:");
    console.error(err);
    throw err;
  }
}

export default getEmbedding;
