import axios from "axios";

const configuredApiOrigin = import.meta.env.VITE_API_ORIGIN;
const primaryApiOrigin = "https://communitypulse-omny.onrender.com";
export const FALLBACK_API_ORIGIN = "http://localhost:5001";

export const API_ORIGIN = configuredApiOrigin || primaryApiOrigin;
export const API_BASE = `${API_ORIGIN}/api`;

export const apiClient = axios.create({
  baseURL: API_ORIGIN,
});

export const buildApiUrl = (path = "") => {
  if (!path) return API_BASE;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/api")) {
    return `${API_ORIGIN}${path}`;
  }

  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};
