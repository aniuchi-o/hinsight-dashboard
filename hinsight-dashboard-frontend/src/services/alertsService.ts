import { apiClient, getAccessToken } from './apiClient';
import type { IAlertsFeedResponse, IAlertFilters, IAcknowledgeAlertPayload, IAlert } from '../types/alerts.types';
import {
    getAcknowledgedIds, getDismissedIds,
    acknowledgeAlertId, acknowledgeAllIds, unacknowledgeAllIds,
} from '../utils/alertPersistence';

const SEED_ALERTS: Readonly<IAlert>[] = [
    {
        id: 'alert-001', type: 'THRESHOLD_BREACH', severity: 'CRITICAL',
        title: 'Stress concerns exceed 30% workforce threshold',
        description: 'The number of employees reporting high stress levels has surpassed the 30% population threshold.',
        affectedMetric: 'CF_str_Count', affectedValue: 421, thresholdValue: 374,
        percentageOfWorkforce: 33.8, relatedView: 'overview', tenantId: 'demo',
        isAcknowledged: false, acknowledgedByRole: null, acknowledgedAt: null,
        isDismissed: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), expiresAt: null,
    },
    {
        id: 'alert-002', type: 'RISK_SPIKE', severity: 'WARNING',
        title: 'Cardiovascular disease risk increased by 8% since last period',
        description: 'D_CVD_risk_Count has increased by 8.2 percentage points compared to the previous 30-day rolling average.',
        affectedMetric: 'D_CVD_risk_Count', affectedValue: 143, thresholdValue: 132,
        percentageOfWorkforce: 11.5, relatedView: 'lifestyle', tenantId: 'demo',
        isAcknowledged: false, acknowledgedByRole: null, acknowledgedAt: null,
        isDismissed: false, createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), expiresAt: null,
    },
    {
        id: 'alert-003', type: 'IMPROVEMENT_REGRESSION', severity: 'WARNING',
        title: 'Obesity improvement rate dropped below 25% baseline',
        description: 'The tracked improvement rate for obesity-related metrics has declined to 22%.',
        affectedMetric: 'D_obesity_improvement_rate', affectedValue: 22, thresholdValue: 25,
        percentageOfWorkforce: null, relatedView: 'nutrition_obesity', tenantId: 'demo',
        isAcknowledged: false, acknowledgedByRole: null, acknowledgedAt: null,
        isDismissed: false, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), expiresAt: null,
    },
    {
        id: 'alert-004', type: 'COHORT_SUPPRESSION', severity: 'INFORMATIONAL',
        title: 'Cancer metrics suppressed � cohort below k-anonymity threshold',
        description: 'CF_CanC_Count contains fewer than 10 individuals. Suppressed per k-anonymity requirements.',
        affectedMetric: 'CF_CanC_Count', affectedValue: 7, thresholdValue: 10,
        percentageOfWorkforce: null, relatedView: 'overview', tenantId: 'demo',
        isAcknowledged: false, acknowledgedByRole: null, acknowledgedAt: null,
        isDismissed: false, createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'alert-005', type: 'DATA_STALENESS', severity: 'INFORMATIONAL',
        title: 'Feelings dashboard data is 26 hours old',
        description: 'The aggregated data for the Feelings dashboard view has not refreshed within the expected 24-hour window.',
        affectedMetric: null, affectedValue: null, thresholdValue: null,
        percentageOfWorkforce: null, relatedView: 'feelings', tenantId: 'demo',
        isAcknowledged: false, acknowledgedByRole: null, acknowledgedAt: null,
        isDismissed: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), expiresAt: null,
    },
];

let _currentUserId = '';
export function setAlertsUserId(userId: string): void { _currentUserId = userId; }

function applyClientFilters(alerts: IAlert[], filters: IAlertFilters): IAlert[] {
    return alerts.filter((a) => {
        if (filters.type !== 'ALL' && a.type !== filters.type) return false;
        if (filters.relatedView !== 'ALL' && a.relatedView !== filters.relatedView) return false;
        if (!filters.showDismissed && a.isDismissed) return false;
        return true;
    });
}

function fetchAlertsMock(filters: IAlertFilters): IAlertsFeedResponse {
    const ackedIds = _currentUserId ? getAcknowledgedIds(_currentUserId) : new Set<string>();
    const dismissedIds = _currentUserId ? getDismissedIds(_currentUserId) : new Set<string>();
    const hydrated = SEED_ALERTS.map((a) => ({
        ...a,
        isAcknowledged: ackedIds.has(a.id),
        acknowledgedAt: ackedIds.has(a.id) ? new Date().toISOString() : null,
        isDismissed: dismissedIds.has(a.id),
    }));
    let filtered = hydrated;
    if (filters.severity !== 'ALL') filtered = filtered.filter((a) => a.severity === filters.severity);
    if (!filters.showAcknowledged) filtered = filtered.filter((a) => !a.isAcknowledged);
    filtered = applyClientFilters(filtered, filters);
    return {
        alerts: filtered, totalCount: filtered.length,
        unreadCount: hydrated.filter((a) => !a.isAcknowledged && !a.isDismissed).length,
        page: 1, pageSize: 20, lastRefreshedAt: new Date().toISOString(),
    };
}

export async function fetchAlerts(filters: IAlertFilters, _page = 1): Promise<IAlertsFeedResponse> {
    if (getAccessToken()) {
        try {
            const params = new URLSearchParams();
            if (filters.severity !== 'ALL') params.set('severity', filters.severity);
            params.set('show_acknowledged', filters.showAcknowledged ? 'true' : 'false');
            const { data } = await apiClient.get<IAlertsFeedResponse>(`/api/v1/alerts?${params}`);
            const alerts = applyClientFilters(data.alerts, filters);
            return { ...data, alerts, totalCount: alerts.length };
        } catch { /* fall through to mock */ }
    }
    return fetchAlertsMock(filters);
}

export async function acknowledgeAlert(payload: IAcknowledgeAlertPayload): Promise<void> {
    if (getAccessToken()) {
        await apiClient.post(`/api/v1/alerts/${payload.alertId}/acknowledge`, {});
        return;
    }
    if (_currentUserId) acknowledgeAlertId(_currentUserId, payload.alertId);
}

export async function acknowledgeAllAlerts(): Promise<void> {
    if (getAccessToken()) {
        try {
            const { data } = await apiClient.get<IAlertsFeedResponse>('/api/v1/alerts?show_acknowledged=false');
            await Promise.all(
                data.alerts
                    .filter((a) => !a.isAcknowledged)
                    .map((a) => apiClient.post(`/api/v1/alerts/${a.id}/acknowledge`, {}))
            );
        } catch { /* ignore */ }
        return;
    }
    if (_currentUserId) acknowledgeAllIds(_currentUserId, SEED_ALERTS.map((a) => a.id));
}

export async function unacknowledgeAllAlerts(): Promise<void> {
    if (getAccessToken()) {
        try {
            const { data } = await apiClient.get<IAlertsFeedResponse>('/api/v1/alerts?show_acknowledged=true');
            await Promise.all(
                data.alerts
                    .filter((a) => a.isAcknowledged)
                    .map((a) => apiClient.delete(`/api/v1/alerts/${a.id}/acknowledge`))
            );
        } catch { /* ignore */ }
        return;
    }
    if (_currentUserId) unacknowledgeAllIds(_currentUserId);
}
