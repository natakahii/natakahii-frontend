import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.natakahii.com/api/v1";

// General API client for public catalog endpoints (categories, products, vendors)
const catalogApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// Attach Authorization header if user is logged in
catalogApi.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("token");
        if (token && !config.headers?.Authorization) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// ─── Categories ───────────────────────────────────────────────
export const fetchCategories = () => {
    return catalogApi.get("/categories");
};

export const fetchCategoryFilters = (categoryId) => {
    return catalogApi.get(`/categories/${categoryId}/filters`);
};

// ─── Products ─────────────────────────────────────────────────
export const fetchProducts = (params = {}) => {
    return catalogApi.get("/products", { params });
};

export const fetchProduct = (productId) => {
    return catalogApi.get(`/products/${productId}`);
};

// ─── Vendors ──────────────────────────────────────────────────
export const fetchVendors = (params = {}) => {
    return catalogApi.get("/vendors", { params });
};

export default catalogApi;
