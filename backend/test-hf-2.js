import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const client = new InferenceClient(process.env.HF_TOKEN);

async function test(model, task) {
    try {
        console.log(`Testing ${model} for task ${task}...`);
        if (task === 'image-to-text') {
            await client.imageToText({
                model: model,
                data: Buffer.from([]), 
            });
        } else if (task === 'text-generation') {
             await client.textGeneration({
                model: model,
                inputs: "Hello",
                parameters: { max_new_tokens: 10 }
            });
        } else if (task === 'chat-completion') {
            await client.chatCompletion({
                model: model,
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 10
            });
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}

async function runTests() {
    await test("Salesforce/blip-image-captioning-base", "image-to-text");
    await test("nlpconnect/vit-gpt2-image-captioning", "image-to-text");
    await test("microsoft/Phi-3-mini-4k-instruct", "chat-completion");
    await test("Qwen/Qwen2.5-7B-Instruct", "chat-completion");
}

runTests();
