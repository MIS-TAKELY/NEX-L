import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
    console.log("Starting Cloudinary Credential Test...");
    console.log("Config:", {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET ? "REDACTED" : "MISSING",
    });

    try {
        console.log("Pinging Cloudinary...");
        const result = await cloudinary.api.ping();
        console.log("✅ Success! Cloudinary credentials are valid.");
        console.log("Result:", result);
    } catch (error) {
        console.error("❌ Failed! Cloudinary rejected your credentials.");
        console.error("Error Message:", error.message);
        console.error("Full Error:", JSON.stringify(error, null, 2));
    }
}

test();
