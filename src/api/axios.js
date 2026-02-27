import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.natakahii.com/api/v1";

const api = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// separate client for refresh calls to avoid interceptor recursion
const refreshClient = axios.create({
    baseURL: api.defaults.baseURL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// Attach Authorization header from localStorage token on each request (if present)
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = window.localStorage.getItem("token");
        if (token && !config.headers?.Authorization) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// On 401 responses, try to refresh the token once, then retry the original request
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config;

        if (status === 401 && !originalRequest?._retry) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await refreshClient.post("/refresh");
                const { token } = refreshResponse?.data || {};

                if (token && typeof window !== "undefined") {
                    window.localStorage.setItem("token", token);
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
                // optional: clear token if refresh fails
                if (typeof window !== "undefined") {
                    window.localStorage.removeItem("token");
                }
                console.error("Token refresh failed", refreshError?.response?.data || refreshError);
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;