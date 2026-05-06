import { API_BASE } from './api';

export const ZONO_ADMIN_LOGIN_PATH = '/zono-admin-auth-portal';
export const ZONO_ADMIN_DASHBOARD_PATH = '/zono-admin-control-center';
export const ZONO_ADMIN_API_PATH = import.meta.env.VITE_ZONO_ADMIN_API_PATH || '/api/zono-secure-admin';
export const ZONO_ADMIN_API_BASE = `${API_BASE}${ZONO_ADMIN_API_PATH}`;
