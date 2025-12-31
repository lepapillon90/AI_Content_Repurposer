/**
 * AIService
 * Handles interaction with Google Gemini API to generate content.
 */
class AIService {
    constructor() {
        this.provider = localStorage.getItem('rep_ai_provider') || 'gemini';
        this.apiKey = localStorage.getItem('rep_api_key') || 'AlzaSyB-arYE785mPj8q1lPusdesE7q9StF_PDA';
        this.openaiKey = localStorage.getItem('rep_openai_key') || '';
        this.model = 'gemini-2.5-flash'; // Updated to latest stable model
        this.openaiModel = 'gpt-4o-mini';
    }

    setProvider(provider) {
        this.provider = provider;
        localStorage.setItem('rep_ai_provider', provider);
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    setOpenAIKey(key) {
        this.openaiKey = key;
    }

    /**
     * Simple check to see if the API key is valid
     * @returns {Promise<boolean>}
     */
    async validateApiKey() {
        if (!this.apiKey) return false;

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            console.error('Gemini Validation Error:', error);
            return false;
        }
    }

    async validateOpenAIKey() {
        if (!this.openaiKey) return false;

        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${this.openaiKey}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('OpenAI Validation Error:', error);
            return false;
        }
    }

    /**
     * Generate content based on platforms, brand, and input text
     */
    async generateContent(text, platforms, language = 'Korean', brandId = null) {
        const currentKey = this.provider === 'openai' ? this.openaiKey : this.apiKey;

        if (!currentKey && this.provider === 'openai') {
            throw new Error('OpenAI API Key is missing. Please set it in Settings.');
        }

        if (this.provider === 'openai') {
            return await this.callOpenAI(text, platforms, language, brandId);
        } else {
            const prompt = this.constructMegaPrompt(text, platforms, language, brandId);
            return await this.callGemini(prompt);
        }
    }

    /**
     * OpenAI Specific Generation
     */
    async callOpenAI(text, platforms, language, brandInput) {
        let brandInfo = 'None';
        let brand = null;

        if (typeof brandInput === 'string' && window.brandService) {
            brand = window.brandService.getById(brandInput);
        } else if (brandInput && typeof brandInput === 'object') {
            brand = brandInput;
        }

        if (brand) {
            brandInfo = `브랜드명: ${brand.name}, 톤앤매너: ${brand.tone}, 스타일: ${brand.style}, 필수 키워드: ${brand.keywords || '없음'}, 금지어: ${brand.forbidden || '없음'}`;
        }

        const platformList = platforms.join(', ');
        const systemPrompt = `You are a social media expert. Create engaging content based on the input. Optimize for platforms: [${platformList}]. Adhere to brand profiles (tone, style, keywords, forbidden words). Maintain character limits for each platform. Output Language: ${language}. Use Markdown format with '## [Platform Name]' headers.`;

        // Add platform specific constraints for better quality
        let constraints = '';
        platforms.forEach(p => {
            constraints += this.getPlatformSpecificInstruction(p);
        });

        const userMessage = `원본 텍스트: "${text}"\n\n브랜드 설정: ${brandInfo}\n\n추가 제약사항:\n${constraints}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiKey}`
                },
                body: JSON.stringify({
                    model: this.openaiModel,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMsg = errorData.error?.message || 'OpenAI API Request Failed';
                const errorCode = errorData.error?.code || '';

                if (errorCode === 'invalid_api_key' || errorMsg.includes('invalid') || response.status === 401) {
                    throw new Error('OPENAI_INVALID_KEY');
                } else if (errorCode === 'insufficient_quota' || response.status === 429) {
                    throw new Error('OPENAI_QUOTA_EXCEEDED');
                }

                throw new Error(errorMsg);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (e) {
            console.error('OpenAI Error:', e);
            throw e;
        }
    }

    /**
     * Construct the Mega Prompt for multi-platform generation (Gemini)
     */
    constructMegaPrompt(text, platforms, language, brandInput) {
        let brandInstruction = '';
        let brand = null;

        if (typeof brandInput === 'string' && window.brandService) {
            brand = window.brandService.getById(brandInput);
        } else if (brandInput && typeof brandInput === 'object') {
            brand = brandInput;
        }

        if (brand) {
            brandInstruction = `
### Brand Profile Guidelines (STRICTLY FOLLOW)
- **Brand Name**: ${brand.name}
- **Tone & Voice**: ${brand.tone}
- **Style Guide**: ${brand.style}
- **Mandatory Keywords**: ${brand.keywords || 'None'}
- **Forbidden Words**: ${brand.forbidden || 'None'}

${brand.examples ? `**Example Sentences (Mimic this phrasing and rhythm):**\n${brand.examples}\n` : ''}
`;
        }

        let taskInstruction = `
You are a world-class Content Marketing AI Agent specialized in Multi-Platform Repurposing.
Your task is to repurpose the user's input into high-performing social media posts for: ${platforms.join(', ')}.

**Core Directives**:
1. **Tone Consistency**: If a Brand Profile is provided, reflect its personality perfectly.
2. **Platform Native**: Each output must feel native to the platform (formatting, length, visual cues).
3. **Agency Quality**: Write professionally, but with high impact. Use hooks and patterns used by top creators.
4. **Mandatory Keywords**: ALWAYS include identified mandatory keywords naturally if provided.
5. **Character Limits**: STRICTLY adhere to platform character limits.

**Formatting**:
- Output Language: ${language}
- Use Markdown.
- Separate platforms with "## [Platform Name]" headers.

${brandInstruction}
`;

        platforms.forEach(p => {
            taskInstruction += this.getPlatformSpecificInstruction(p);
        });

        taskInstruction += `
### Final Analysis
At the very end of the response, please add a "## Post-Generation Analysis" section:
1. **Recommended Hashtags**: 5-10 relevant hashtags.
2. **SEO Keywords**: High-traffic keywords used.
3. **Virality Score**: 0-100 score + 1 sentence logic.

### Input Content for Repurposing:
"${text}"
`;
        return taskInstruction;
    }

    getPlatformSpecificInstruction(platform) {
        const instructions = {
            twitter: `
#### Twitter Thread Rules:
- Header: ## Twitter Thread
- **Limit**: MAX 280 characters per tweet. NO exceptions.
- **Structure**: Compelling thread (3-5 tweets).
- **Hook**: First tweet must be a world-class hook. Use '🧵 1/x' numbering.
`,
            linkedin: `
#### LinkedIn Post Rules:
- Header: ## LinkedIn Post
- **Limit**: 1000 - 2000 characters (optimal for algorithm).
- **Structure**: Headline -> Problem -> Solution -> Bullet Points -> CTA.
- **Tone**: Thought-leadership, professional but conversational.
`,
            instagram: `
#### Instagram & Reels Rules:
- Header: ## Instagram Reels & Caption
- **Limit**: Caption under 1000 characters.
- **Visual Script**: 3-5 scenes with [Visual] and [Audio] cues.
- **Goal**: Shareable value and high-engagement CTA.
`,
            youtube: `
#### YouTube Shorts Rules:
- Header: ## YouTube Shorts Script
- **Limit**: Max 60 seconds of content (approx 160 words).
- **Structure**: 0-5s Hook, 5-50s Mid-value, 50-60s CTA.
- **Retention**: Describe fast-paced visual cuts for every 2-3 seconds of audio.
`,
            tiktok: `
#### TikTok Script Rules:
- Header: ## TikTok Script
- **Limit**: 15-45 seconds is optimal.
- **Style**: High energy, immediate hook (0-2 seconds).
- **Engagement**: Use "Text on Screen" prompts for every scene.
`
        };
        return instructions[platform] || '';
    }

    async translateContent(text, targetLanguage) {
        if (this.provider === 'openai') {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiKey}`
                },
                body: JSON.stringify({
                    model: this.openaiModel,
                    messages: [
                        { role: 'system', content: `You are a helpful translator. Translate the following text to ${targetLanguage}. Maintain the original tone, emoji usage, and formatting style exactly.` },
                        { role: 'user', content: text }
                    ]
                })
            });
            const data = await response.json();
            return data.choices[0].message.content;
        } else {
            const prompt = `Translate the following text to ${targetLanguage}. Maintain the original tone, emoji usage, and formatting style exactly.\n\n[Text to Translate]:\n${text}`;
            return await this.callGemini(prompt);
        }
    }

    async callGemini(promptText) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        try {
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
        } catch (e) {
            console.error(e);
            throw e;
        }
    }
}

window.aiService = new AIService();

