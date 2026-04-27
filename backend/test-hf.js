import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const client = new InferenceClient(process.env.HF_TOKEN);

async function test() {
    try {
        console.log("Testing Salesforce/blip-image-captioning-base...");
        // Just a dummy test to see if it responds or gives provider error
        // Note: this might fail since we don't have a real image, but we want to see the error type
        await client.imageToText({
            model: "Salesforce/blip-image-captioning-base",
            data: Buffer.from([]), 
        });
    } catch (e) {
        console.log("Error:", e.message);
    }
}

test();
