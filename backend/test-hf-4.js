import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const client = new InferenceClient(process.env.HF_TOKEN);

async function test() {
    try {
        console.log("Testing gpt2 with provider='hf-inference'...");
        const res = await client.textGeneration({
            model: "gpt2",
            inputs: "The capital of France is",
            provider: "hf-inference",
            parameters: { max_new_tokens: 5 }
        });
        console.log("Success:", res.generated_text);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

test();
