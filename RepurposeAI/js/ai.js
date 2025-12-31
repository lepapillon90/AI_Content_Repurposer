/**
 * AIService
 * Handles interaction with Google Gemini API to generate content.
 */
class AIService {
    constructor() {
        // Key provided by user via image - Default
        // If this is still invalid, user can input their own in the UI.
        this.apiKey = 'AlzaSyB-arYE785mPj8q1lPusdesE7q9StF_PDA';
        this.model = 'gemini-2.5-flash'; // Updated to match user's screenshot
    }

    /**
     * Set the API Key
     * @param {string} key 
     */
    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Generate content based on platform and input text
     * @param {string} text - The source text
     * @param {string} platform - Target platform (twitter, linkedin, instagram, youtube)
     * @param {string} language - Target language (Korean, English, etc.)
     * @returns {Promise<string>} - Generated content
     */
    async generateContent(text, platform, language = 'Korean') {
        if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
            console.warn('API Key is missing. Using mock response.');
            return this.getMockResponse(text, platform);
        }

        const promptData = this.getPrompt(text, platform, language);
        // Combine system instruction and user prompt for Gemini (or use systemInstruction if model supports it, 
        // but 1.5-flash simple chat works well with combined prompt for this case)
        const activePrompt = `${promptData.system}\n\n${promptData.user}`;

        try {
            return await this.callGemini(activePrompt);
        } catch (error) {
            console.error('AI Generation Error:', error);
            throw error;
        }
    }

    /**
     * Construct specific prompts for each platform
     */
    getPrompt(text, platform, language) {
        const languageInstruction = `Output Language: ${language}. Ensure the tone and nuances are natural for a native speaker of this language.`;

        const prompts = {
            twitter: {
                system: `You are a social media expert specializing in Twitter growth. Convert the user's input into an engaging, viral-worthy Twitter Thread. \n- Use '🧵 1/x' format.\n- Keep sentences punchy and short.\n- Use emojis moderately.\n- End with a call to action or question.\n${languageInstruction}`,
                user: `Content to repurpose: "${text}"`
            },
            linkedin: {
                system: `You are a LinkedIn top voice and thought leader. Repurpose the user's input into a professional, insightful LinkedIn post. \n- Use a strong hook/headline.\n- Use bullet points for readability.\n- Tone: Professional yet personal and authentic.\n- Include relevant hashtags at the bottom.\n${languageInstruction}`,
                user: `Content to repurpose: "${text}"`
            },
            instagram: {
                system: `You are an Instagram influencer. Create an engaging caption for the user's content. \n- Start with a catchy hook.\n- Include a 'Save this post' reminder.\n- Use a friendly, energetic tone.\n- Include a block of relevant hashtags.\n${languageInstruction}`,
                user: `Content to repurpose: "${text}"`
            },
            youtube: {
                system: `You are a YouTube creative director. Write a 60-second YouTube Shorts script based on the user's input. \n- Format: [Visual Cue] followed by [Audio/Narration].\n- Keep it fast-paced.\n- Include a strong hook in the first 3 seconds.\n- End with a subscribe call to action.\n${languageInstruction}`,
                user: `Content to repurpose: "${text}"`
            }
        };

        return prompts[platform] || prompts.twitter;
    }

    /**
     * Translate existing content
     * @param {string} text 
     * @param {string} targetLanguage 
     */
    async translateContent(text, targetLanguage) {
        if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
            console.warn('API Key is missing for translation. Using mock.');
            return `[Mock Translation to ${targetLanguage}]\n${text}`;
        }

        const prompt = `Translate the following text to ${targetLanguage}. Maintain the original tone, emoji usage, and formatting style exactly.\n\n[Text to Translate]:\n${text}`;

        try {
            return await this.callGemini(prompt);
        } catch (error) {
            console.error('Translation Error:', error);
            throw error;
        }
    }

    /**
     * Helper to call Gemini API
     */
    async callGemini(promptText) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Gemini API Request Failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    /**
     * Temporary mock response
     */
    getMockResponse(text, platform) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mock = `[MOCK GEMINI GENERATION for ${platform.toUpperCase()}]\n\n(API Key issue or fallback on "${text.substring(0, 20)}...")`;
                resolve(mock);
            }, 1500);
        });
    }
}

// Export instance
window.aiService = new AIService();
