// ==============================================================================
// Quantum Leap — Production API Configuration
// Automatically adapts between local development and Vercel production
// ==============================================================================

const rawBase = (import.meta.env.VITE_API_URL || "http://localhost:8000").trim();
export const BACKEND_URL = rawBase.replace(/\/$/, "");
export const API_BASE = `${BACKEND_URL}/api/v1`;

export default API_BASE;
