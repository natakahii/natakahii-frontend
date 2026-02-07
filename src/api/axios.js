import axios from "axios"

const api = axios.create ({
    baseURL: "https://api.natakahii.com/api/v1/auth",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

export default api;