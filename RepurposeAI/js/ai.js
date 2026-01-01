/**
 * AIService
 * Handles interaction with Google Gemini API to generate content.
 */
class AIService {
    constructor() {
        this.provider = localStorage.getItem('rep_ai_provider') || 'gemini';
        this.apiKey = localStorage.getItem('rep_api_key') || 'AIzaSyB-arYE785mPj8q1lPusdesE7q9StF_PDA';
        this.openaiKey = localStorage.getItem('rep_openai_key') || '';
        this.model = 'gemini-2.0-flash-exp'; // Updated to latest preview model
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
    async generateContent(text, platforms, language = 'Korean', brandInput = null) {
        const currentKey = this.provider === 'openai' ? this.openaiKey : this.apiKey;

        if (!currentKey && this.provider === 'openai') {
            throw new Error('OpenAI API Key is missing. Please set it in Settings.');
        }

        if (this.provider === 'openai') {
            return await this.callOpenAI(text, platforms, language, brandInput);
        } else {
            const prompt = this.constructMegaPrompt(text, platforms, language, brandInput);
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
            brandInfo = `브랜드명: ${brand.name}, 톤앤매너: ${brand.tone}, 스타일: ${brand.style}, 필수 키워드: ${brand.keywords || '없음'}, 금지어: ${brand.forbidden || '없음'}, 타겟 오디언스: ${brand.target || '없음'}${brand.examples ? `, 예시 문장: ${brand.examples}` : ''}`;
        }

        const platformList = platforms.join(', ');
        const systemPrompt = `You are a social media expert. Create engaging content based on the input. Optimize for platforms: [${platformList}].
- Adhere to the provided brand profile (Tone, Style, Target Audience, Example Sentences).
- **Automatic Highlighting**: You ARE encouraged to use HTML tags for emphasis on KEY information:
    - Use <b>text</b> for bolding important phrases.
    - Use <span style="color:red">text</span> for CRITICAL alerts or key takeaways.
- DO NOT use any markdown asterisks (* or **). Use ONLY the provided HTML tags for emphasis.
- If 'Naver Blog' is selected, follow these specific SEO rules:
    - Primary Keyword Placement: Put the main keyword at the beginning of the title.
    - Structure: Use ## for Main Sections and ### for Sub-sections to mimic Smart Editor One.
    - Media Guide: Insert '[IMAGE: 관련 이미지 설명]' placeholders frequently.
    - Depth: Provide detailed information (Long-form content, 1,000+ characters).
    - Engagement: End naturally by encouraging comments or empathy.
- Strictly keep forbidden words out of the content.
- **Automatic Highlighting**: You ARE encouraged to use HTML tags for emphasis on KEY information:
    - Use <b>text</b> for bolding important phrases.
    - Use <u>text</u> for underlining.
    - Use <span style="color:red">text</span> for CRITICAL alerts or key takeaways.
- DO NOT use markdown emphasis like bold (**) or italic (*). ONLY use the above HTML tags for highlighting.
Maintain character limits for each platform. Output Language: ${language}.
Use Markdown format. Use EXACTLY '## [Platform Name]' (e.g., ## Naver Blog) for each platform section.
DO NOT use '##' for sub-headers INSIDE the content; use '###' or '####' for sub-sections.
---
SPECIAL INSTRUCTIONS FOR NAVER BLOG:
If 'Naver Blog' is selected, follow these SEO rules:
1. Title Optimization: Place the primary keyword at the very beginning of the title. Use numbers or curiosity-gap phrases.
2. Structure (Smart Editor One Style): Use ## for Main Sections (H2) and ### for Sub-sections (H3).
3. Image Placeholders: Insert '[IMAGE: 브리핑과 관련된 고화질 이미지 설명]' between sections (approx. every 2-3 paragraphs).
4. Keyword Density: Naturally include keywords 3-5 times in the body.
5. Content Depth: Aim for informative, long-form content (1,000-1,500+ characters).
6. Interaction: End with a question or '공감/댓글' request to encourage engagement.

CRITICAL OUTPUT INSTRUCTION:
After generating the content, you MUST append a JSON object containing analysis data. This JSON object must be separated from the content by the delimiter "---METADATA---".

The JSON object MUST contain a "platforms" key, where each sub-key is the EXACT platform header name used in the content (e.g., "Twitter Thread", "LinkedIn Post").

For EACH platform, you MUST evaluate these 4 criteria step-by-step to calculate "viralScore":
1. Hook (0-40 pts): Does the first line grab attention immediately?
2. Value (0-30 pts): Is the content highly informative or entertaining?
3. Structure (0-20 pts): Is it readable (bullet points, spacing)?
4. CTA (0-10 pts): Is the Call-To-Action clear?
SUM these scores for the final "viralScore".

The JSON structure:
{
  "platforms": {
    "<Exact Header Name>": {
      "viralScore": <number 0-100>,
      "viralScoreReason": "Hook: [Score]/40, Value: [Score]/30, Structure: [Score]/20, CTA: [Score]/10. [한국어로 된 간략한 분석 코멘트]",
      "decomposed": {
        "hook": {"score": <number>, "comment": "<string> (Brief Korean comment)"},
        "value": {"score": <number>, "comment": "<string> (Brief Korean comment)"},
        "structure": {"score": <number>, "comment": "<string> (Brief Korean comment)"},
        "cta": {"score": <number>, "comment": "<string> (Brief Korean comment)"}
      },
      "keywords": ["<string>", "<string>", "..." (max 10 high-impact keywords)],
      "seoTitle": "<string>"
    },
    ... repeated for each platform ...
  }
}
ENSURE THE JSON IS VALID. DO NOT WRAP IN MARKDOWN CODE BLOCKS.
`;

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
- **Target Audience**: ${brand.target || 'None'}

${brand.examples ? `**Example Sentences (Mimic this phrasing and rhythm):**\n${brand.examples}\n` : ''}
`;
        }

        let taskInstruction = `
You are a World-Class Visual Storytelling Expert and Content Marketing Master.
Your task is to repurpose the user's input into high-performing, visually engaging social media content for: ${platforms.join(', ')}.

**Visual Storytelling Rules (STRICT COMPLIANCE REQUIRED)**:
1. **Strategic Impact**: Identify the point of maximum emotional or visual impact (usually immediately after a hook or right before a key reveal/twist).
2. **Inline Image Tags**: Insert exactly ONE [IMAGE: "detailed description"] tag at that identified location.
3. **Advanced Prompting for Nano Banana**: The description inside the tag must follow this format: "[Subject, Background, Lighting, Style]".
    - **CRITICAL**: For the image description, you MUST append this suffix: ", high-end advertising photography, cinematic lighting, sharp focus, professional color grading, minimalist composition, trending on artstation, masterpiece, 8k resolution, (no text, no watermark)".
    - *Example*: "인공지능의 미래는 밝습니다. [IMAGE: 고층 빌딩 숲 위로 떠오르는 거대한 홀로그램 뇌, 네온 블루 조명, 사이버펑크 스타일, high-end advertising photography, cinematic lighting, sharp focus, professional color grading, minimalist composition, trending on artstation, masterpiece, 8k resolution, (no text, no watermark)] 이 기술을 선점하는 자가..."

**Core Directives**:
1. **Tone Consistency**: Reflect the Brand Profile (if provided) perfectly.
2. **Platform Native**: Each output must feel native to the platform (formatting, length, visual cues).
3. **Automatic Highlighting**: Use HTML tags (<b>, <u>, <span style="color:red">) ONLY for emphasis. DO NOT use markdown asterisks.
4. **Naver Blog SEO**: 
    - Put primary keyword at the very beginning of the title.
    - Use ## for Main Sections and ### for Sub-sections.
    - Insert [IMAGE:] tags approx. every 2-3 paragraphs.
    - End with '공감/댓글' request.
5. **Video Platforms (Shorts, Reels, TikTok)**: Use the Scene-based structure provided in the platform instructions.
6. **Strict Formatting**: 
    - Output Language: ${language}
    - Use Markdown.
    - Separate platforms with EXACTLY "## [Platform Name]" headers.
    - DO NOT use "##" for internal headers; use "###" or lower.

${brandInstruction}
`;

        platforms.forEach(p => {
            taskInstruction += this.getPlatformSpecificInstruction(p);
        });

        taskInstruction += `
### Final Analysis
At the very end of the response, you MUST append a JSON object containing analysis data. This JSON object must be separated from the content by the delimiter "---METADATA---".

The JSON object MUST contain a "platforms" key, where each sub-key is the EXACT platform header name used in the content (e.g., "Twitter Thread", "LinkedIn Post").

For EACH platform, you MUST evaluate these 4 criteria step-by-step to calculate its "viralScore":
1. Hook (0-40 pts): Does the first line grab attention immediately?
2. Value (0-30 pts): Is the content highly informative or entertaining?
3. Structure (0-20 pts): Is it readable (bullet points, spacing)?
4. CTA (0-10 pts): Is the Call-To-Action clear?
SUM these scores for its final "viralScore".

The JSON structure:
{
  "platforms": {
    "<Exact Header Name>": {
      "viralScore": <number 0-100>,
      "viralScoreReason": "Hook: [Score]/40, Value: [Score]/30, Structure: [Score]/20, CTA: [Score]/10. [한국어로 된 간략한 분석 코멘트]",
      "decomposed": {
        "hook": {"score": <number>, "comment": "<string> (Brief Korean comment)"},
        "value": {"score": <number>, "comment": "<string> (Brief Korean comment)"},
        "structure": {"score": <number>, "comment": "<string> (Brief Korean comment)"},
        "cta": {"score": <number>, "comment": "<string> (Brief Korean comment)"}
      },
      "keywords": ["<string>", "<string>", "..." (max 10 high-impact keywords)],
      "seoTitle": "<string>"
    },
    ... repeated for each platform ...
  }
}
ENSURE THE JSON IS VALID. DO NOT WRAP IN MARKDOWN CODE BLOCKS.

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
#### Instagram Reels Script Rules:
- Header: ## Instagram Reels Script
- **Structure**: MANDATORY Scene-based layout:
    - **Scene 1: 오프닝 (5초)** - 강력한 후킹으로 시선 고정
    - **Scene 2: 문제 제시 (5초)** - 핵심 페인포인트나 공감대 형성
    - **Scene 3: 해결 과정 (10초)** - 본문 내용 및 해결책 제시
    - **Scene 4: 결과/Call-to-Action (10초)** - 변화된 모습 및 행동 유도
- **Format**: USE A TABLE for the script with columns: [Scene, Time, Visual, Audio, Text Overlay].
- **Visuals**: Be highly descriptive (e.g., "Fast cut to...").
- **Audio**: Specify trending audio feel or voiceover tone.
- **Caption**: Under 1000 characters. First line must be a hook. Use line breaks.
- **Hashtags**: 10-15 relevant hashtags at the bottom.
`,
            youtube: `
#### YouTube Shorts Script Rules:
- Header: ## YouTube Shorts Script
- **3 Hook Options**: Provide 3 different strong hook variations at the start.
- **Structure**: MANDATORY Scene-based layout:
    - **Scene 1: 오프닝 (5초)** - 강력한 후킹으로 시선 고정
    - **Scene 2: 문제 제시 (5초)** - 핵심 페인포인트나 공감대 형성
    - **Scene 3: 해결 과정 (10초)** - 본문 내용 및 해결책 제시
    - **Scene 4: 결과/Call-to-Action (10초)** - 변화된 모습 및 행동 유도
- **Format**: USE A STRICT TABLE format:
  | Scene | Time | Visual (Detailed) | Audio (Narration) | Text Overlay |
  |-------|------|-------------------|-------------------|--------------|
- **Pacing**: Fast cuts every 2-3 seconds.
- **Retention**: Visuals must change frequently to maintain attention.
- **CTA**: Clear call-to-action in the last Scene.
`,
            tiktok: `
#### TikTok Script Rules:
- Header: ## TikTok Script
- **Structure**: MANDATORY Scene-based layout:
    - **Scene 1: 오프닝 (5초)** - 강력한 후킹으로 시선 고정
    - **Scene 2: 문제 제시 (5초)** - 핵심 페인포인트나 공감대 형성
    - **Scene 3: 해결 과정 (10초)** - 본문 내용 및 해결책 제시
    - **Scene 4: 결과/Call-to-Action (10초)** - 변화된 모습 및 행동 유도
- **Format**: USE A TABLE format: [Scene, Time, Visual, Audio, Text].
- **Hook**: First 3 seconds are critical. Start with a visual disruption or strong statement.
- **Style**: High energy, raw, authentic feel.
- **Engagement**: Explicit instructions for stickers or "Link in bio" pointers.
- **Trends**: If applicable, suggest a relevant trending sound or format.
`,
            instagram_feed: `
#### Instagram Feed Post Rules:
- Header: ## Instagram Feed
- **Visual Suggestion**: Describe a compelling image or carousel idea (3-5 slides).
- **Caption**: Impactful storytelling style. Use line breaks for readability.
- **Hashtags**: Top 10-15 high-performance tags separated from text.
`,
            naver_blog: `
#### Naver Blog Post Rules:
- Header: ## Naver Blog
- **Structure**: Clear Title -> Introduction -> Body (3-4 sections) -> Summary -> CTA.
- **Tone**: Professional, trustworthy, and polite (polite Korean style).
- **SEO**: Use bullet points and focus on high-traffic keyword placement.
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

    async callGemini(promptText, isImage = false) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${isImage ? 'gemini-2.0-flash-exp' : this.model}:generateContent?key=${this.apiKey}`;
        // Note: For image generation, the system prompt or model selection needs to be specific.
        // Current Gemini models in Vertex/AI Studio use specific endpoints or configurations for Imagen.
        // For 'gemini-2.0-flash-exp', it supports multimodal input/output but image generation might need specific instructions.

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

            // Handle image response if applicable (Gemini 2.0 can generate images in some configurations)
            // If it returns text instructions for image generation, we might need a separate call to an Imagen model.
            // For now, assuming standard text response or specific multimodal response.
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    /**
     * Generate an image using Google's Nano Banana (Imagen 3 / Gemini 2.0)
     */
    async generateImage(prompt) {
        if (!this.apiKey) throw new Error('GEMINI_API_KEY_MISSING');

        // Note: Direct image generation via gemini-2.0-flash-exp generateContent 
        // usually returns a specific part type if configured for image output.
        // For Vertex AI, the model is 'imagen-3.0-generate-001'.
        // For Gemini API (AI Studio), image generation is often handled within the same flow.

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`;

        const body = {
            contents: [{
                parts: [{
                    text: `Generate a high-quality, professional image based on this description. 
                    Objective: Content marketing asset.
                    Style: Clean, modern, high-resolution. 
                    Description: ${prompt}`
                }]
            }],
            generationConfig: {
                // Some versions use response_mime_type: "image/png" or similar
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Image Generation Failed');
            }

            const data = await response.json();

            // Check for inlineData (Base64 image) in the response parts
            const parts = data.candidates[0].content.parts;
            const imagePart = parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('image/'));

            if (imagePart) {
                return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            }

            // Fallback: If it only returned text (meaning image generation isn't enabled or failed to trigger)
            console.warn('Image part not found in Gemini response. It may have returned text instead.');
            return null;
        } catch (e) {
            console.error('generateImage Error:', e);
            throw e;
        }
    }
}

window.aiService = new AIService();

