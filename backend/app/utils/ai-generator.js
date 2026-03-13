import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
    console.error("Error: HF_TOKEN is not set in .env file");
}

const client = new InferenceClient(HF_TOKEN);

/**
 * Generate course description, category, and tags from a title
 * @param {string} title - The course title
 * @returns {Promise<{description: string, category: string, tags: string[]}>}
 */
export async function generateCourseContent(title) {
    const fallbackContent = generateFallbackContent(title);
    
    try {
        console.log("Attempting AI generation for title:", title);
        
        // Using a very common model that should have a provider
        const prompt = `Task: Generate course metadata for an online learning platform.
Course Title: "${title}"
Provide exactly this format:
Description: [2 paragraphs]
Category: [Development, Business, Design, or Marketing]
Tags: [5 comma-separated tags]`;

        const response = await client.textGeneration({
            model: "google/flan-t5-xxl", 
            inputs: prompt,
            parameters: { max_new_tokens: 500 },
        });

        const content = response.generated_text;
        console.log("AI Response received:", content);

        if (!content || content.trim().length < 50) {
            console.log("AI response too short or empty, using fallback.");
            return fallbackContent;
        }

        const descriptionMatch = content.match(/Description:\s*(.*?)(?=Category:|$)/s);
        const categoryMatch = content.match(/Category:\s*(.*?)(?=Tags:|$)/i);
        const tagsMatch = content.match(/Tags:\s*(.*?)(?=$)/i);

        const description = descriptionMatch ? descriptionMatch[1].trim() : fallbackContent.description;
        let category = categoryMatch ? categoryMatch[1].trim() : fallbackContent.category;
        
        const allowedCategories = ["Development", "Business, Design, Marketing"];
        const foundCategory = allowedCategories.find(c => category.toLowerCase().includes(c.toLowerCase()));
        if (foundCategory) category = foundCategory;

        const tags = tagsMatch 
            ? tagsMatch[1].split(",").map(t => t.trim()).filter(t => t !== "")
            : fallbackContent.tags;

        return { description, category, tags };
    } catch (err) {
        console.error("AI Generation failed, using rule-based fallback:", err.message);
        return fallbackContent;
    }
}

function generateFallbackContent(title) {
    const titleLower = title.toLowerCase();
    let category = "Development";
    let tags = ["Education", "Learning", "Online Course"];
    
    if (titleLower.includes("react") || titleLower.includes("javascript") || titleLower.includes("web") || titleLower.includes("coding")) {
        category = "Development";
        tags = ["Web Development", "Programming", "Frontend", "JavaScript", "Software"];
    } else if (titleLower.includes("business") || titleLower.includes("marketing") || titleLower.includes("sales") || titleLower.includes("money")) {
        category = "Business";
        tags = ["Entrepreneurship", "Strategy", "Growth", "Management", "Success"];
    } else if (titleLower.includes("design") || titleLower.includes("ui") || titleLower.includes("ux") || titleLower.includes("art")) {
        category = "Design";
        tags = ["Creative", "User Experience", "Visuals", "Interface", "Creativity"];
    }

    const description = `This comprehensive course on "${title}" is designed to take you from a beginner to an expert level. Through structured lessons and hands-on projects, you will master the core concepts and advanced techniques needed to excel in this field.\n\nWhether you are looking to start a new career or upgrade your existing skills, this course provides the perfect roadmap. Join thousands of successful students and start your journey towards excellence today!`;

    return { description, category, tags };
}

export default generateCourseContent;
