import axios from "axios";

// Log the API URL being used
const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
console.log("API URL:", apiUrl);

// Create axios instance with default config
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.headers
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  async (error) => {
    console.error(`API Error for ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem("token");
      // Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
