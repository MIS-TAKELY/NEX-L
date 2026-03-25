import { pipeline, env } from "@xenova/transformers";

// Optional: Configure local cache behavior
env.allowRemoteModels = true;

// Singleton pattern to ensure we only load the 80MB model once per server process.
let extractorPromise = null;

async function getEmbedding(text) {
  try {
    if (!extractorPromise) {
      console.log("Loading local embedding model (Xenova/all-MiniLM-L6-v2)...");
      extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }

    const extractor = await extractorPromise;
    console.log("Generating embedding for text length:", text.length);

    // Generate embeddings (output is a tensor)
    // We pool mean and normalize for cosine similarity readiness.
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // Convert Float32Array to standard JavaScript Array
    const flatEmbedding = Array.from(output.data);
    
    console.log("Embedding generated successfully. Dimensions:", flatEmbedding.length);

    return flatEmbedding;
  } catch (err) {
    console.error("Embedding generation failed:");
    console.error(err);
    // return an empty array or throw. We throw to let the caller handle it.
    throw err;
  }
}

export default getEmbedding;
