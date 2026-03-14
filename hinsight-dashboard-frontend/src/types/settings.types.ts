/**
 * SETTINGS TYPE DEFINITIONS
 * Settings contain only UI preferences and session metadata — no PHI.
 */

export type DefaultDashboardView =
    | 'overview'
    | 'lifestyle'
    | 'nutrition_obesity'
    | 'feelings';

export type AlertDigestFrequency = 'NONE' | 'DAILY' | 'WEEKLY';
export type ChartAnimationPreference = 'ENABLED' | 'REDUCED' | 'DISABLED';
export type DataDisplayMode = 'COUNTS_AND_PERCENTAGES' | 'PERCENTAGES_ONLY' | 'COUNTS_ONLY';

export interface IUserPreferences {
    defaultView: DefaultDashboardView;
    chartAnimation: ChartAnimationPreference;
    dataDisplayMode: DataDisplayMode;
    highContrast: boolean;
    reducedMotion: boolean;
    alertDigestFrequency: AlertDigestFrequency;
}

export interface ISessionInfo {
    sessionId: string;
    tenantId: string;
    tenantRegion: 'CA' | 'US';
    lastLoginAt: string;
    sessionStartedAt: string;
    sessionTimeoutMinutes: number;
    ipRegion: string | null;
}

export interface IComplianceAcknowledgement {
    hipaaNoticeAcceptedAt: string | null;
    phipaNoticeAcceptedAt: string | null;
    dataRetentionPolicyVersion: string;
    lastPolicyReviewedAt: string | null;
    requiresReacceptance: boolean;
}

export interface IUserSettings {
    userId: string;
    preferences: IUserPreferences;
    session: ISessionInfo;
    compliance: IComplianceAcknowledgement;
}

export type IUpdatePreferencesPayload = Partial<IUserPreferences>;

export interface IAcceptCompliancePayload {
    noticeType: 'HIPAA' | 'PHIPA' | 'DATA_RETENTION';
    policyVersion: string;
    acceptedAt: string;
}
