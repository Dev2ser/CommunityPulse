import axios from "axios";

export const API_ORIGIN = "http://192.168.1.111:5001";
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
