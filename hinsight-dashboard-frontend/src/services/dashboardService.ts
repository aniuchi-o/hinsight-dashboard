import { apiClient, getAccessToken } from './apiClient';
import { transformInsightsResponse } from './insightsTransformer';
import { IDashboardViewData, IKPIMetrics, IContributingFactorCounts } from '../types/dashboard.types';

// ── Mock fallback data (used when insights API is unavailable) ─────────────

const MOCK_KPIS: IKPIMetrics = {
    totalEmployees: 1247,
    sleepCount: 312,
    nutritionCount: 278,
    stressCount: 421,
    depressionCount: 187,
    smokeCount: 143,
    obesityCount: 356,
    movementCount: 298,
    wellnessCount: 224,
};

const MOCK_WELLBEING: IContributingFactorCounts = {
    sleep: 312,
    depression: 187,
    smoke: 143,
    stress: 421,
    nutrition: 278,
    movement: 298,
    wellness: 224,
    obesity: 356,
};

const MOCK_OVERVIEW: IDashboardViewData = {
    kpis: MOCK_KPIS,
    wellbeingOverview: MOCK_WELLBEING,
    conditionSummary: [
        { condition: 'No Condition', count: 438 },
        { condition: 'Hypertension', count: 312 },
        { condition: 'Type 2 Diabetes', count: 187 },
        { condition: 'Cardiovascular Disease', count: 143 },
        { condition: 'Chronic Kidney Disease', count: 98 },
        { condition: 'Mental Illness', count: 224 },
        { condition: 'Osteoporosis', count: 76 },
        { condition: 'Cancer', count: 54 },
    ],
    employeesWithConditions: [
        { condition: 'Sleep Issues', count: 312 },
        { condition: 'Stress', count: 421 },
        { condition: 'Depression', count: 187 },
        { condition: 'Smoking', count: 143 },
        { condition: 'Obesity', count: 356 },
    ],
    severityOfSuffering: [
        { factor: 'Sleep', min: 1, q1: 3, median: 5, q3: 7, max: 10 },
        { factor: 'Stress', min: 2, q1: 4, median: 6, q3: 8, max: 10 },
        { factor: 'Depression', min: 1, q1: 2, median: 4, q3: 6, max: 9 },
        { factor: 'Nutrition', min: 1, q1: 3, median: 5, q3: 6, max: 9 },
        { factor: 'Movement', min: 1, q1: 2, median: 4, q3: 6, max: 8 },
        { factor: 'Smoke', min: 2, q1: 4, median: 5, q3: 7, max: 10 },
    ],
    improvementRates: [
        { factor: 'Sleep', rate: 42, color: '#4EADA0' },
        { factor: 'Stress', rate: 35, color: '#5B5EA6' },
        { factor: 'Nutrition', rate: 58, color: '#7B6FA0' },
        { factor: 'Movement', rate: 63, color: '#E8896A' },
        { factor: 'Wellness', rate: 29, color: '#4B4D6D' },
        { factor: 'Obesity', rate: 22, color: '#6B6E94' },
    ],
    lastUpdatedAt: new Date().toISOString(),
};

const VIEW_MOCK: Record<string, IDashboardViewData> = {
    overview: MOCK_OVERVIEW,
    lifestyle: { ...MOCK_OVERVIEW, kpis: { ...MOCK_KPIS, stressCount: 421, sleepCount: 312, movementCount: 298 } },
    'nutrition-obesity': { ...MOCK_OVERVIEW, kpis: { ...MOCK_KPIS, nutritionCount: 278, obesityCount: 356 } },
    feelings: { ...MOCK_OVERVIEW, kpis: { ...MOCK_KPIS, depressionCount: 187, stressCount: 421 } },
};

// ── Ingest payload shape (Section 4 of Integration Guide) ────────────────
export interface IIngestPayload {
    source: string;
    category: string;
    value: number;
    timestamp: string;
}

// ── Health check — GET /healthz (unauthenticated) ─────────────────────────
export async function healthCheck(): Promise<{ status: string }> {
    const { data } = await apiClient.get<{ status: string }>('/healthz');
    return data;
}

// ── Hinsight summary — GET /hinsight (authenticated) ──────────────────────
export async function fetchHinsightSummary(): Promise<unknown> {
    const { data } = await apiClient.get('/hinsight');
    return data;
}

// ── Data ingestion — POST /api/v1/ingest (authenticated) ──────────────────
export async function submitIngestData(payload: IIngestPayload): Promise<unknown> {
    const { data } = await apiClient.post('/api/v1/ingest', payload);
    return data;
}

// ── Demo export — GET /v1/demo/export (dev fallback) ──────────────────────
export async function fetchDemoExport(): Promise<unknown> {
    const { data } = await apiClient.get('/v1/demo/export');
    return data;
}

// ── Real API call with automatic fallback ──────────────────────────────────

export async function fetchDashboardData(view: string): Promise<IDashboardViewData> {
    // Only attempt the real API when we have a valid token
    if (getAccessToken()) {
        try {
            const { data } = await apiClient.get('/api/v1/insights', {
                params: { view },
            });
            return transformInsightsResponse(data);
        } catch {
            // 403 / network error → fall through to mock data
        }
    }
    return VIEW_MOCK[view] ?? MOCK_OVERVIEW;
}
