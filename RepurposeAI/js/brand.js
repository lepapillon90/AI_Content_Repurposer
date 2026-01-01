class BrandService {
    constructor() {
        this.STORAGE_KEY = 'rep_brands';
        this.CURRENT_BRAND_KEY = 'rep_current_brand_id';
        this.brands = this.loadBrands();
    }

    loadBrands() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        let brands = stored ? JSON.parse(stored) : [];

        // Seed Defaults if empty (either null or empty array)
        if (brands.length === 0) {
            brands = [
                {
                    id: 'brand_default_tech',
                    name: 'IT Tech Insider',
                    tone: '전문적이고 분석적인 (Professional & Analytical)',
                    style: '간결함, 두괄식, 전문 용어 적절히 사용',
                    keywords: '혁신, AI, 자동화, 효율성, 미래지향적',
                    forbidden: '모호한 표현, 감정적인 호소, ~해요체',
                    examples: 'AI 기술의 발전은 단순한 자동화를 넘어 의사결정 프로세스의 혁신을 의미합니다.\\n효율적인 워크플로우 구축을 위해 클라우드 기반 솔루션 도입이 필수적입니다.',
                    target: '개발자, IT 종사자, 스타트업 대표',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'brand_default_vibe',
                    name: 'Daily Vibe (감성 브이로그)',
                    tone: '친근하고 따뜻한 (Friendly & Warm)',
                    style: '대화체, 이모지 가득, 공감 유도',
                    keywords: '힐링, 소확행, 일상, 카페, 감성',
                    forbidden: '딱딱한 문어체, 부정적인 단어, 복잡한 설명',
                    examples: '오늘 날씨 정말 좋죠? ☀️ 잠깐 산책 나왔는데 힐링 그 자체네요 🌿\\n소소하지만 확실한 행복, 여러분의 오늘 하루는 어땠나요? 💭✨',
                    target: '2030 여성, 라이프스타일 관심층',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            this.saveBrands(brands); // Save immediately
        }
        return brands;
    }

    saveBrands(brandsToSave = null) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(brandsToSave || this.brands));
    }

    getAll() {
        return this.brands;
    }

    getById(id) {
        return this.brands.find(b => b.id === id);
    }

    save(brandData) {
        const timestamp = new Date().toISOString();

        if (brandData.id) {
            // Update existing
            const index = this.brands.findIndex(b => b.id === brandData.id);
            if (index !== -1) {
                this.brands[index] = { ...this.brands[index], ...brandData, updatedAt: timestamp };
                this.saveBrands();
                return this.brands[index];
            }
        }

        // Create new
        const newBrand = {
            id: 'brand_' + Date.now().toString(36),
            ...brandData,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        this.brands.push(newBrand);
        this.saveBrands();
        return newBrand;
    }

    delete(id) {
        this.brands = this.brands.filter(b => b.id !== id);
        this.saveBrands();

        // If deleted brand was selected, clear selection
        if (this.getCurrentBrandId() === id) {
            localStorage.removeItem(this.CURRENT_BRAND_KEY);
        }
    }

    setCurrentBrandId(id) {
        if (id) {
            localStorage.setItem(this.CURRENT_BRAND_KEY, id);
        } else {
            localStorage.removeItem(this.CURRENT_BRAND_KEY);
        }
    }

    getCurrentBrandId() {
        return localStorage.getItem(this.CURRENT_BRAND_KEY);
    }

    getCurrentBrand() {
        const id = this.getCurrentBrandId();
        return id ? this.getById(id) : null;
    }
}

// Export specific instance or class depending on usage pattern
// For this app we'll attach to window like other services
window.BrandService = BrandService;
window.brandService = new BrandService();
