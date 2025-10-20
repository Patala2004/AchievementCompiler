// apiClient.ts
import axios from "axios";

// Create a preconfigured Axios instance
export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api", // adjust if needed, e.g. "http://localhost:8000/api"
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically include token from localStorage if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);
