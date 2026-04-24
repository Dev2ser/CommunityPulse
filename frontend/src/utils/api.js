import axios from "axios";

const configuredApiOrigin = import.meta.env.VITE_API_ORIGIN;
const localApiOrigin = "http://localhost:5001";
const productionApiOrigin = "https://communitypulse-omny.onrender.com";

const browserHostname =
  typeof window !== "undefined" ? window.location.hostname : "";
const browserProtocol =
  typeof window !== "undefined" ? window.location.protocol : "http:";

const isLoopbackHost = ["localhost", "127.0.0.1", "::1"].includes(
  browserHostname
);

const inferredDevApiOrigin = browserHostname
  ? `${browserProtocol}//${browserHostname}:5001`
  : null;

// Keep env override highest priority. In dev, avoid loopback calls from non-loopback origins.
export const API_ORIGIN = configuredApiOrigin
  ? configuredApiOrigin
  : import.meta.env.DEV
  ? isLoopbackHost
    ? localApiOrigin
    : inferredDevApiOrigin || localApiOrigin
  : productionApiOrigin;
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
