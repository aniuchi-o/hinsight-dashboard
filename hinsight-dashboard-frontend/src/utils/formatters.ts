import type { DataDisplayMode } from '../types/settings.types';

export function formatCount(value: number): string {
    return value.toLocaleString();
}

export function formatPercent(value: number, decimals = 1): string {
    return `${value.toFixed(decimals)}%`;
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format a metric value according to the active data-display mode.
 * @param count   Raw employee count
 * @param mode    Current DataDisplayMode from SettingsContext
 * @param total   Population denominator (e.g. TOTAL_EMPLOYEES)
 * @param pctOverride  Optional pre-computed percentage (skips auto-calc)
 */
export function formatMetricDisplay(
    count: number,
    mode: DataDisplayMode,
    total: number,
    pctOverride?: number,
): string {
    const pct = pctOverride ?? Math.round((count / total) * 1000) / 10;
    switch (mode) {
        case 'COUNTS_ONLY':
            return formatCount(count);
        case 'PERCENTAGES_ONLY':
            return formatPercent(pct);
        case 'COUNTS_AND_PERCENTAGES':
        default:
            return `${formatCount(count)} (${formatPercent(pct)})`;
    }
}
