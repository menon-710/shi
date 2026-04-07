/**
 * Production: set VITE_API_URL to your backend origin (no trailing slash), e.g.
 *   https://shi-jlk4.onrender.com
 * Local dev: leave unset — Vite proxy forwards /api to localhost:5000.
 */
const trim = (s) => (s || '').replace(/\/$/, '');

const backendOrigin = trim(import.meta.env.VITE_API_URL);

export const API_ROOT = backendOrigin ? `${backendOrigin}/api` : '/api';
export const CHAT_API_ROOT = `${API_ROOT}/chat`;
