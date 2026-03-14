/**
 * ALERTS TYPE DEFINITIONS
 *
 * Alert payloads contain ONLY aggregated statistics and governance signals.
 * They MUST NEVER contain: employee names, IDs, individual risk scores,
 * or any data that could identify a specific person.
 */

import type { UserRole } from './auth.types';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFORMATIONAL';

export type AlertType =
    | 'THRESHOLD_BREACH'
    | 'RISK_SPIKE'
    | 'IMPROVEMENT_REGRESSION'
    | 'DATA_STALENESS'
    | 'COHORT_SUPPRESSION'
    | 'SYSTEM_NOTICE';

export type AlertRelatedView =
    | 'overview'
    | 'lifestyle'
    | 'nutrition_obesity'
    | 'feelings'
    | 'system'
    | null;

export interface IAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    description: string;
    affectedMetric: string | null;
    affectedValue: number | null;
    thresholdValue: number | null;
    percentageOfWorkforce: number | null;
    relatedView: AlertRelatedView;
    tenantId: string;
    isAcknowledged: boolean;
    acknowledgedByRole: UserRole | null;
    acknowledgedAt: string | null;
    isDismissed: boolean;
    createdAt: string;
    expiresAt: string | null;
}

export interface IAlertFilters {
    severity: AlertSeverity | 'ALL';
    type: AlertType | 'ALL';
    relatedView: AlertRelatedView | 'ALL';
    showAcknowledged: boolean;
    showDismissed: boolean;
}

export interface IAlertsFeedResponse {
    alerts: IAlert[];
    totalCount: number;
    unreadCount: number;
    page: number;
    pageSize: number;
    lastRefreshedAt: string;
}

export interface IAcknowledgeAlertPayload {
    alertId: string;
    note?: string;
}
