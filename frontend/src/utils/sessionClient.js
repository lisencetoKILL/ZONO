const SESSION_CACHE_KEY = 'zono-session-cache-v1';
const SESSION_CACHE_TTL_MS = 15000;

let memoryCache = null;

const now = () => Date.now();

const isFresh = (entry) => {
    if (!entry || typeof entry !== 'object') return false;
    if (!entry.fetchedAt) return false;
    return now() - Number(entry.fetchedAt) <= SESSION_CACHE_TTL_MS;
};

const safeParse = (value) => {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

export const getCachedSession = () => {
    if (isFresh(memoryCache)) {
        return memoryCache.data;
    }

    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;

    const parsed = safeParse(raw);
    if (!isFresh(parsed)) {
        sessionStorage.removeItem(SESSION_CACHE_KEY);
        return null;
    }

    memoryCache = parsed;
    return parsed.data;
};

export const setSessionCache = (data) => {
    const entry = {
        data,
        fetchedAt: now(),
    };

    memoryCache = entry;
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(entry));
    window.dispatchEvent(new Event('zono-session-updated'));
};

export const clearSessionCache = () => {
    memoryCache = null;
    sessionStorage.removeItem(SESSION_CACHE_KEY);
    window.dispatchEvent(new Event('zono-session-updated'));
};

export const fetchSessionCached = async ({ force = false } = {}) => {
    if (!force) {
        const cached = getCachedSession();
        if (cached) return cached;
    }

    const response = await fetch('http://localhost:3001/auth/session', {
        credentials: 'include',
    });

    const data = await response.json();
    setSessionCache(data);
    return data;
};
