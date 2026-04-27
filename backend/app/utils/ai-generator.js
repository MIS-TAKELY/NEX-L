import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const HF_PROVIDER = process.env.HF_PROVIDER || "hf-inference";

if (!HF_TOKEN) {
    console.error("Error: HF_TOKEN is not set in .env file");
}

const client = new InferenceClient(HF_TOKEN);

const parseModelList = (value, fallback) => {
    if (!value || typeof value !== "string") return fallback;
    const parsed = value
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    return parsed.length ? parsed : fallback;
};

const IMAGE_TO_TEXT_MODELS = parseModelList(
    process.env.HF_IMAGE_MODELS,
    [
        "Salesforce/blip-image-captioning-base",
        "nlpconnect/vit-gpt2-image-captioning",
        "Salesforce/blip-image-captioning-large",
    ],
);

const TEXT_GENERATION_MODELS = parseModelList(
    process.env.HF_TEXT_GEN_MODELS,
    [
        "microsoft/Phi-3-mini-4k-instruct",
        "HuggingFaceH4/zephyr-7b-beta",
        "mistralai/Mistral-7B-Instruct-v0.3",
        "Qwen/Qwen2.5-7B-Instruct",
    ],
);

const SUMMARIZATION_MODELS = parseModelList(
    process.env.HF_SUMMARY_MODELS,
    [
        "facebook/bart-large-cnn",
        "sshleifer/distilbart-cnn-12-6",
        "Falconsai/text_summarization",
    ],
);

const providerCandidates = (() => {
    const fromEnv = parseModelList(process.env.HF_PROVIDER_CANDIDATES, []);
    const unique = new Set([HF_PROVIDER, ...fromEnv, "auto"]);
    return Array.from(unique);
})();

function isProviderUnavailableError(err) {
    return /No Inference Provider available/i.test(err?.message || "");
}

function buildRequest(model, provider, extra = {}) {
    const request = { model, ...extra };
    if (provider && provider !== "auto") {
        request.provider = provider;
    }
    return request;
}

async function runWithFallback({ taskName, models, fn }) {
    let lastErr = null;

    for (const provider of providerCandidates) {
        for (const model of models) {
            try {
                console.log(`[AI ${taskName}] Trying model=${model} provider=${provider}`);
                return await fn({ model, provider });
            } catch (err) {
                lastErr = err;
                const errMsg = err.message || "";
                
                // If it's a task mismatch, and we're doing text-generation, try chat completion fallback
                if (taskName === "text-generation" && (errMsg.includes("conversational") || errMsg.includes("text-generation"))) {
                    try {
                        console.log(`[AI ${taskName}] Retrying with chat-completion for model=${model} provider=${provider}`);
                        const response = await client.chatCompletion(
                            buildRequest(model, provider, {
                                messages: [{ role: "user", content: lastErr.inputs || "Continue the task." }],
                                max_tokens: 500,
                            })
                        );
                        return { generated_text: response.choices[0].message.content };
                    } catch (chatErr) {
                        console.warn(`[AI ${taskName}] Chat completion fallback failed for ${model}: ${chatErr.message}`);
                    }
                }

                console.warn(`[AI ${taskName}] model=${model} provider=${provider} failed: ${err.message}`);
            }
        }
    }

    throw lastErr || new Error(`[AI ${taskName}] No model/provider combination succeeded.`);
}

function buildFallbackLearningNotes({ title = "", contextText = "", imageDescription = "", courseTitle = "" } = {}) {
    const safeTitle = title?.trim() || "this lesson";
    const safeCourse = courseTitle?.trim() || "our course";
    const normalizedContext = (contextText || "").replace(/\s+/g, " ").trim();
    const shortContext = normalizedContext ? normalizedContext.slice(0, 320) : "";

    const lines = [
        `Learning Notes: ${safeTitle}`,
        `Course: ${safeCourse}`,
        "",
        "1. Core Topic",
        `- This lesson focuses on ${safeTitle} within the context of ${safeCourse}.`,
    ];

    if (imageDescription) {
        lines.push("", "2. Visual Understanding", `- The visual material indicates: ${imageDescription}`);
    }

    lines.push("", "3. Key Objectives");
    lines.push("- Master the fundamental concepts presented in this section.");
    lines.push("- Be able to explain the relationship between these topics and the broader course theme.");

    if (shortContext) {
        lines.push("", "4. Lesson Context", `- ${shortContext}`);
    }

    return lines.join("\n");
}

function isJunkResponse(text, topic) {
    if (!text || text.length < 50) return true;
    
    const lower = text.toLowerCase();
    const topicLower = (topic || "").toLowerCase();

    // Specific check for the Biology hallucination mentioned by the user
    const biologyKeywords = ["biology", "cell theory", "mitochondria", "natural selection", "botany", "zoology"];
    if (!topicLower.includes("biology") && !topicLower.includes("science") && !topicLower.includes("life")) {
        const found = biologyKeywords.filter(k => lower.includes(k));
        if (found.length >= 2) return true;
    }

    // Check for conversational filler or refusal templates
    if (lower.includes("let's assume") || lower.includes("need to know the specific subject") || lower.includes("provide a general template")) {
        return true;
    }

    return false;
}

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

        const response = await runWithFallback({
            taskName: "text-generation",
            models: TEXT_GENERATION_MODELS,
            fn: async ({ model, provider }) => {
                const req = buildRequest(model, provider, {
                    inputs: prompt,
                    parameters: { max_new_tokens: 500 },
                });
                try {
                    return await client.textGeneration(req);
                } catch (e) {
                    e.inputs = prompt; // Attach inputs for fallback logic
                    throw e;
                }
            },
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
        
        const allowedCategories = ["Development", "Business, Design, Marketing", "Others"];
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

/**
 * Describe image content for learning notes with retry logic
 * @param {string} imageUrl - The URL of the image
 * @param {number} retries - Number of retries for 503 errors
 * @returns {Promise<string>} - Description of the image
 */
export async function describeImage(imageUrl, retries = 3) {
    if (!imageUrl) return "";
    let normalizedUrl = String(imageUrl).trim();
    if (!normalizedUrl) return "";
    if (normalizedUrl.startsWith("//")) {
        normalizedUrl = `https:${normalizedUrl}`;
    }
    if (!/^https?:\/\//i.test(normalizedUrl)) {
        console.log("[AI Vision] Skipping non-http image URL.");
        return "";
    }

    try {
        console.log(`[AI Vision] Attemping to fetch image: "${normalizedUrl}"`);
        
        const imageRes = await fetch(normalizedUrl);
        if (!imageRes.ok) {
            console.error(`[AI Vision] Image fetch failed: ${imageRes.status} ${imageRes.statusText} for URL: ${normalizedUrl}`);
            return "";
        }
        
        const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
        console.log(`[AI Vision] Successfully buffered image: ${imageBuffer.length} bytes`);

        const response = await runWithFallback({
            taskName: "image-to-text",
            models: IMAGE_TO_TEXT_MODELS,
            fn: async ({ model, provider }) =>
                client.imageToText(
                    buildRequest(model, provider, { data: imageBuffer }),
                ),
        });

        console.log("[AI Vision] Image analysis result:", response.generated_text);
        return response.generated_text || "";

    } catch (err) {
        // Handle Hugging Face model loading (503)
        if (err.message.includes("503") && retries > 0) {
            console.log(`[AI Vision] Model is loading... retrying in 3s (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            return describeImage(imageUrl, retries - 1);
        }

        console.error("[AI Vision] Failed:", err.message);
        return "";
    }
}

/**
 * Summarize long text or generate notes from a title/image
 * @param {string} text - The input text to summarize
 * @param {string} mode - 'short' or 'elaborated'
 * @param {string} title - Optional title to use if text is missing
 * @param {string} imageUrl - Optional image URL to describe and summarize
 * @returns {Promise<string>} - The summarized or generated text
 */
export async function summarizeText(text, mode = 'short', title = '', imageUrl = '', courseTitle = '') {
    const originalText = text || "";
    let contextText = originalText;
    const hasOriginalText = originalText && originalText.trim().length > 20;
    let imageDescription = "";

    try {
        // If it's an image, get its description first
        if (imageUrl) {
            imageDescription = await describeImage(imageUrl);
            if (imageDescription) {
                console.log("[AI Context] Incorporating image description.");
                contextText = `[Learning Material Image Description: ${imageDescription}] \n\n${contextText}`;
            } else {
                console.log("[AI Context] Image vision returned no content.");
            }
        }

        const hasContext = contextText && contextText.trim().length > 20;
        const contextWordCount = contextText ? contextText.trim().split(/\s+/).length : 0;
        const hasImageOnlyContext = Boolean(imageDescription) && !hasOriginalText;
        console.log(`Attempting AI ${hasContext ? 'summarization' : 'generation'} (${mode}) for title: "${title}"`);
        
        if (!hasContext && title) {
            // Generate initial notes if no text or image content found
            const prompt = `Task: Generate educational learning notes.
Course: "${courseTitle || 'General'}"
Topic: "${title}"
Instructions: Provide a structured, professional breakdown of what a student should understand about this specific topic. 
Do NOT include any introductory conversational filler like "Certainly!" or "Here is the breakdown". 
Start directly with the content. Use Markdown for formatting (headings, bold, lists).
Notes:`;

            const response = await runWithFallback({
                taskName: "text-generation",
                models: TEXT_GENERATION_MODELS,
                fn: async ({ model, provider }) => {
                    const req = buildRequest(model, provider, {
                        inputs: prompt,
                        parameters: { max_new_tokens: 600 },
                    });
                    try {
                        return await client.textGeneration(req);
                    } catch (e) {
                        e.inputs = prompt;
                        throw e;
                    }
                },
            });

            const genText = response.generated_text;
            if (isJunkResponse(genText, title)) {
                console.warn("[AI] Detected junk/generic response, falling back.");
                return buildFallbackLearningNotes({ title, courseTitle });
            }

            console.log("Notes generation completed.");
            return genText || `Introduction to ${title}: [AI could not generate detailed notes at this time]`;
        }

        if (mode === 'elaborated') {
            const prompt = `Task: Provide a detailed, elaborated, and structured summary of the following educational content. 
Break it down into key concepts, main points, and a concluding summary.
Content: "${contextText}"
Elaborated Summary:`;

            const response = await runWithFallback({
                taskName: "text-generation",
                models: TEXT_GENERATION_MODELS,
                fn: async ({ model, provider }) => {
                    const req = buildRequest(model, provider, {
                        inputs: prompt,
                        parameters: { max_new_tokens: 800 },
                    });
                    try {
                        return await client.textGeneration(req);
                    } catch (e) {
                        e.inputs = prompt;
                        throw e;
                    }
                },
            });

            console.log("Elaboration completed.");
            return response.generated_text || contextText;
        } else {
            // Image-only or very short context performs better with instruction-style generation.
            if (hasImageOnlyContext || contextWordCount < 80) {
                const prompt = `Task: Create concise study notes from the educational material below.
Use short headings and practical takeaways for students.
${courseTitle ? `Course: "${courseTitle}"` : ""}
${title ? `Topic: "${title}"` : ""}
Content: "${contextText}"
Study Notes:`;

                const response = await runWithFallback({
                    taskName: "text-generation",
                    models: TEXT_GENERATION_MODELS,
                    fn: async ({ model, provider }) => {
                        const req = buildRequest(model, provider, {
                            inputs: prompt,
                            parameters: { max_new_tokens: 450 },
                        });
                        try {
                            return await client.textGeneration(req);
                        } catch (e) {
                            e.inputs = prompt;
                            throw e;
                        }
                    },
                });

                return response.generated_text || buildFallbackLearningNotes({ title, contextText, imageDescription });
            }

            // Using BART for standard short summarization
            const response = await runWithFallback({
                taskName: "summarization",
                models: SUMMARIZATION_MODELS,
                fn: async ({ model, provider }) =>
                    client.summarization(
                        buildRequest(model, provider, {
                            inputs: contextText,
                            parameters: {
                                max_length: 250,
                                min_length: 40,
                                do_sample: false
                            }
                        }),
                    ),
            });

            console.log("Short summarization completed.");
            return response.summary_text || contextText;
        }
    } catch (err) {
        console.error(`${mode} AI task failed:`, err.message);
        if (isProviderUnavailableError(err)) {
            const fallbackNotes = (hasOriginalText || contextText?.trim() || title)
                ? buildFallbackLearningNotes({ title, contextText, imageDescription })
                : "";
            const configHint = "AI provider unavailable for current HF token/models. Configure Inference Providers at https://hf.co/settings/inference-providers or set HF_PROVIDER/HF_*_MODELS in backend env.";
            return [fallbackNotes, configHint].filter(Boolean).join("\n\n");
        }
        if (hasOriginalText || contextText?.trim()) {
            return buildFallbackLearningNotes({ title, contextText, imageDescription });
        }
        if (title) {
            return buildFallbackLearningNotes({ title });
        }
        return "Learning notes could not be generated at the moment. Please try again.";
    }
}

export async function askQuestionToAI(question, context, courseTitle = '', imageUrl = '') {
    if (!question) return "Please provide a question.";
    
    let imageDescription = "";
    let effectiveContext = context || 'General educational material';

    try {
        if (imageUrl) {
            console.log(`[AI Q&A] Vision: Fetching description for ${imageUrl.slice(0, 50)}...`);
            imageDescription = await describeImage(imageUrl);
            if (imageDescription) {
                console.log("[AI Q&A] Vision: Image description obtained");
                effectiveContext = `[Visual Content from Image Analysis]:\n${imageDescription}\n\n${effectiveContext}`;
            }
        }
        
        console.log(`[AI Q&A] Final Context Sample (${effectiveContext.length} chars): "${effectiveContext.slice(0, 150)}..."`);

        const prompt = `Task: Answer the student's question based on the provided educational context.
Role: You are an AI Tutor for the NEX-L learning platform. Your tone should be encouraging, professional, and clear.
${courseTitle ? `Course Context: "${courseTitle}"` : ""}

Context Hierarchy:
1. Lesson Content/Text: Use this for factual details, price points, and previously generated notes.
2. Visual Content: Use the image analysis if the student asks specifically about something "in the image".

Educational Context (MANDATORY TO USE IF RELEVANT):
"${effectiveContext}"

Student Question: "${question}"

Instructions: 
- Answer the student's question accurately using ONLY the context provided above if the answer exists there.
- CRITICAL: If the student asks about price, names, or details visible in the text/notes, provided they were found in the context, give that specific answer!
- CRITICAL: Do NOT say "I cannot see the image" if the information is present in the "Lesson Content/Text" or "Generated AI Notes". 
- If the answer is truly not in any of the provided context, you may use general knowledge but clearly state: "Based on general knowledge...".
- Keep the answer concise (under 300 words).
- Use Markdown (bold, lists) for readability.
Answer:`;



        const response = await runWithFallback({
            taskName: "text-generation",
            models: TEXT_GENERATION_MODELS,
            fn: async ({ model, provider }) => {
                const req = buildRequest(model, provider, {
                    inputs: prompt,
                    parameters: { max_new_tokens: 600 },
                });
                try {
                    return await client.textGeneration(req);
                } catch (e) {
                    e.inputs = prompt;
                    throw e;
                }
            },
        });

        return response.generated_text || "I'm sorry, I couldn't generate an answer at this time.";
    } catch (err) {
        console.error("[AI Q&A] Failed:", err.message);
        return "The AI assistant is currently busy or unavailable. Please try asking again in a moment.";
    }
}


export default generateCourseContent;
