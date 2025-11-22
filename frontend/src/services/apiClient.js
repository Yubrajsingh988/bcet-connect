// src/services/apiClient.js
import axios from "axios";

/**
 * Simple helper that reads token from localStorage.
 * Using it here keeps apiClient independent from React contexts
 * (so server code/tests can still call it).
 */
export const getToken = () => {
  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - attach token if present
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/**
 * Response interceptor. If you want centralized logout / refresh-token handling,
 * provide `onUnauthenticated` handler via `api._onUnauthenticated`.
 *
 * Example usage in AuthContext:
 *   api._onUnauthenticated = () => logout();
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        if (typeof api._onUnauthenticated === "function") api._onUnauthenticated();
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;
