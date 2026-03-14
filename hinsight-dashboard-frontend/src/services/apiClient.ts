/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// ── In-memory token storage (HIPAA-compliant — never localStorage) ───────
let inMemoryAccessToken: string | null = null;
type DataRegion = 'CA' | 'US';

const normalizeDataRegion = (region: unknown): DataRegion => {
    const value = typeof region === 'string' ? region.trim().toUpperCase() : '';
    return value === 'US' ? 'US' : 'CA';
};

const API_KEY = import.meta.env.VITE_API_KEY ?? 'dev-key';

export const setAccessToken = (token: string | null): void => {
    inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => inMemoryAccessToken;

// ── Data region (from JWT `reg` claim) ───────────────────────────────────
let currentDataRegion: DataRegion = normalizeDataRegion(import.meta.env.VITE_DATA_REGION);

export const setDataRegion = (region: DataRegion): void => {
    currentDataRegion = normalizeDataRegion(region);
};

export const getDataRegion = (): DataRegion => currentDataRegion;

// ── Factory ──────────────────────────────────────────────────────────────
const createApiClient = (baseURL: string): AxiosInstance => {
    const instance = axios.create({
        baseURL,
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
    });

    // Request interceptor
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            config.headers['X-Data-Region'] = currentDataRegion;
            config.headers['X-API-Key'] = API_KEY;
            config.headers['X-Correlation-ID'] = crypto.randomUUID();
            return config;
        },
        (error: AxiosError) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
        (response) => {
            const remaining = response.headers['x-ratelimit-remaining'];
            if (remaining !== undefined && Number(remaining) < 5) {
                console.warn(`[HINSIGHT] Rate limit warning: ${remaining} requests remaining.`);
            }
            return response;
        },
        (error: AxiosError) => {
            const status = error.response?.status;

            if (status === 401) {
                setAccessToken(null);
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            }

            if (status === 403) {
                console.error('[HINSIGHT] Forbidden:', error.config?.url);
                window.dispatchEvent(new CustomEvent('auth:forbidden'));
            }

            if (status === 400) {
                const detail = (error.response?.data as { detail?: string })?.detail;
                if (detail) return Promise.reject(new Error(detail));
            }

            if (status === 422) {
                const detail = (error.response?.data as { detail?: string })?.detail;
                if (detail) return Promise.reject(new Error(detail));
            }

            if (status === 429) {
                const retryAfter = error.response?.headers['retry-after'];
                const reset = error.response?.headers['x-ratelimit-reset'];
                console.warn(`[HINSIGHT] Rate limited. Retry-After: ${retryAfter}, Reset at: ${reset}`);
                const retryMessage = retryAfter
                    ? `Too many requests. Please wait ${retryAfter} seconds and try again.`
                    : 'Too many requests. Please wait and try again.';
                return Promise.reject(new Error(retryMessage));
            }

            if (status === 500) {
                console.error('[HINSIGHT] Server error:', error.config?.url);
                return Promise.reject(new Error('A server error occurred. Please try again later.'));
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

export const apiClient = createApiClient(
    import.meta.env.VITE_API_BASE_URL ??
    'https://hinsight-api-1046723962483.northamerica-northeast1.run.app'
);

export default apiClient;
