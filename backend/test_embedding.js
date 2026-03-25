import getEmbedding from './app/utils/embedding.js';

try {
  const start = Date.now();
  console.log("Testing full local embedding...");
  const emb = await getEmbedding("This is an amazing course about React and Node.js!");
  console.log("Success! Dimensions:", emb.length);
  console.log("First 3 numbers:", emb.slice(0, 3));
  console.log("Time taken:", (Date.now() - start) / 1000, "seconds");
} catch(err) {
  console.error("Test failed:");
  console.error(err);
}
