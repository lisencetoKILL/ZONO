const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE;

export { API_BASE, SOCKET_URL };
