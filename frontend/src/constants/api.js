const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? API_BASE : '');
const SOCKET_ENABLED = Boolean(SOCKET_URL);

export { API_BASE, SOCKET_URL, SOCKET_ENABLED };
