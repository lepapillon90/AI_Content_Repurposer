class BrandService {
    constructor() {
        this.STORAGE_KEY = 'rep_brands';
        this.CURRENT_BRAND_KEY = 'rep_current_brand_id';
        this.brands = this.loadBrands();
    }

    loadBrands() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    saveBrands() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.brands));
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
