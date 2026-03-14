/**
 * alertPersistence.ts
 *
 * Manages acknowledged / dismissed alert state in localStorage.
 * Scoped per user (sub claim) to prevent cross-user state leakage.
 * Only opaque alert IDs are stored — no PHI/PII.
 */

const STORAGE_KEY_PREFIX = 'hinsight_alerts_';

interface IPersistedAlertState {
    acknowledgedIds: string[];
    dismissedIds: string[];
    updatedAt: string;
}

function storageKey(userId: string): string {
    return `${STORAGE_KEY_PREFIX}${userId}`;
}

function load(userId: string): IPersistedAlertState {
    try {
        const raw = localStorage.getItem(storageKey(userId));
        if (raw) return JSON.parse(raw) as IPersistedAlertState;
    } catch {
        // corrupt data — reset
    }
    return { acknowledgedIds: [], dismissedIds: [], updatedAt: new Date().toISOString() };
}

function save(userId: string, state: IPersistedAlertState): void {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(storageKey(userId), JSON.stringify(state));
}

export function getAcknowledgedIds(userId: string): Set<string> {
    return new Set(load(userId).acknowledgedIds);
}

export function getDismissedIds(userId: string): Set<string> {
    return new Set(load(userId).dismissedIds);
}

export function acknowledgeAlertId(userId: string, alertId: string): void {
    const state = load(userId);
    if (!state.acknowledgedIds.includes(alertId)) {
        state.acknowledgedIds.push(alertId);
    }
    save(userId, state);
}

export function acknowledgeAllIds(userId: string, alertIds: string[]): void {
    const state = load(userId);
    const existing = new Set(state.acknowledgedIds);
    for (const id of alertIds) existing.add(id);
    state.acknowledgedIds = [...existing];
    save(userId, state);
}

export function unacknowledgeAllIds(userId: string): void {
    const state = load(userId);
    state.acknowledgedIds = [];
    save(userId, state);
}

export function dismissAlertId(userId: string, alertId: string): void {
    const state = load(userId);
    if (!state.dismissedIds.includes(alertId)) {
        state.dismissedIds.push(alertId);
    }
    save(userId, state);
}
