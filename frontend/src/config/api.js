// ==============================================================================
// Quantum Leap — Production API Configuration
// Automatically adapts between local development, Vercel production, and cloud backends
// ==============================================================================

const isBrowser = typeof window !== "undefined";
const isHttps = isBrowser && window.location.protocol === "https:";

// 1. Explicit environment variable VITE_API_URL (Render, Railway, Fly.io, etc.)
const envApiUrl = (import.meta.env.VITE_API_URL || "").trim();

let resolvedBase = "";
if (envApiUrl) {
  resolvedBase = envApiUrl.replace(/\/$/, "");
} else if (isHttps) {
  // When running on Vercel (HTTPS), never fall back to insecure http://localhost:8000
  // Instead use relative path so same-origin requests or Vercel rewrites handle it cleanly
  resolvedBase = "";
} else {
  // Local development on HTTP
  resolvedBase = "http://localhost:8000";
}

export const BACKEND_URL = resolvedBase;
export const API_BASE = resolvedBase ? `${resolvedBase}/api/v1` : "/api/v1";

/**
 * Robust JSON fetch wrapper that gracefully guards against non-JSON (e.g. HTML 404/SPA) responses.
 */
export async function safeFetchJson(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    }
    // Non-JSON response (e.g., HTML from Vercel SPA rewrite when route does not exist)
    const text = await res.text();
    return {
      ok: false,
      status: res.status,
      error: `Unexpected response format (${contentType || "text/plain"})`,
      raw: text,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err.message || "Network request failed",
    };
  }
}

export default API_BASE;
