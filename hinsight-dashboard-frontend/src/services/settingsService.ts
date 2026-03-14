import { apiClient, getAccessToken } from './apiClient';
import { decodeJWT, getSessionDuration } from '../utils/jwtUtils';
import type { IUserSettings, IUpdatePreferencesPayload, IAcceptCompliancePayload } from '../types/settings.types';

const PREFS_KEY_PREFIX = 'hinsight_prefs_';

function prefsKey(userId: string): string {
    return `${PREFS_KEY_PREFIX}${userId}`;
}

const DEFAULT_PREFERENCES: IUserSettings['preferences'] = {
    defaultView: 'overview',
    chartAnimation: 'ENABLED',
    dataDisplayMode: 'COUNTS_AND_PERCENTAGES',
    highContrast: false,
    reducedMotion: false,
    alertDigestFrequency: 'WEEKLY',
};

function loadLocalPreferences(userId: string): IUserSettings['preferences'] {
    try {
        const raw = localStorage.getItem(prefsKey(userId));
        if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    } catch { /* corrupt - use defaults */ }
    return { ...DEFAULT_PREFERENCES };
}

function saveLocalPreferences(userId: string, prefs: IUserSettings['preferences']): void {
    localStorage.setItem(prefsKey(userId), JSON.stringify(prefs));
}

export async function fetchUserSettings(): Promise<IUserSettings> {
    const token = getAccessToken();
    const claims = token ? decodeJWT(token) : null;
    const userId = claims?.sub ?? 'anonymous';
    const sessionDuration = token ? getSessionDuration(token) : 0;

    let preferences = loadLocalPreferences(userId);

    let backendCompliance: IUserSettings['compliance'] | null = null;

    if (token) {
        try {
            const { data } = await apiClient.get<{
                userId: string;
                preferences: IUserSettings['preferences'];
                session?: IUserSettings['session'];
                compliance?: IUserSettings['compliance'];
            }>(
                '/api/v1/me/settings'
            );
            preferences = data.preferences;
            backendCompliance = data.compliance ?? null;
            saveLocalPreferences(userId, preferences);
        } catch {
            // backend unavailable - localStorage state is valid fallback
        }
    }

    return {
        userId,
        preferences,
        session: {
            sessionId: crypto.randomUUID(),
            tenantId: claims?.tid ?? '',
            tenantRegion: claims?.reg ?? 'CA',
            lastLoginAt: claims?.iat ? new Date(claims.iat * 1000).toISOString() : new Date().toISOString(),
            sessionStartedAt: claims?.iat ? new Date(claims.iat * 1000).toISOString() : new Date().toISOString(),
            sessionTimeoutMinutes: sessionDuration,
            ipRegion: claims?.reg === 'CA' ? 'Canada' : 'United States',
        },
        compliance: backendCompliance ?? {
            hipaaNoticeAcceptedAt: null,
            phipaNoticeAcceptedAt: null,
            dataRetentionPolicyVersion: '2025-01',
            lastPolicyReviewedAt: null,
            requiresReacceptance: false,
        },
    };
}

export async function updatePreferences(payload: IUpdatePreferencesPayload): Promise<void> {
    const token = getAccessToken();
    const claims = token ? decodeJWT(token) : null;
    const userId = claims?.sub ?? 'anonymous';

    if (token) {
        try {
            await apiClient.put('/api/v1/me/settings', payload);
        } catch { /* fall through to local save */ }
    }

    const current = loadLocalPreferences(userId);
    saveLocalPreferences(userId, { ...current, ...payload });
}

export async function acceptCompliance(payload: IAcceptCompliancePayload): Promise<void> {
    const token = getAccessToken();
    if (!token) return;
    await apiClient.post('/api/v1/me/compliance/accept', payload);
}
