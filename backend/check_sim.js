import getEmbedding from "./app/utils/embedding.js";
import { cosineSimilarity } from "./app/utils/vector-utils.js";

async function check() {
  const query = await getEmbedding("python");
  const match1 = await getEmbedding("Python programming course for beginners");
  const match2 = await getEmbedding("Learn Python");
  const match3 = await getEmbedding("Django web development");
  
  console.log("Sim python -> Python programming:", cosineSimilarity(query, match1));
  console.log("Sim python -> Learn Python:", cosineSimilarity(query, match2));
  console.log("Sim python -> Django:", cosineSimilarity(query, match3));
}
check();
