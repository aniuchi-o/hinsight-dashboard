import { MINIMUM_COHORT_SIZE } from '../types/dashboard.types';

/**
 * HIPAA Data Minimization Enforcement
 * Suppresses any data point where the underlying cohort is too small,
 * preventing re-identification of individuals through small-group inference.
 */
export function enforceAggregationThreshold<T extends { count: number }>(
    data: T[],
    threshold: number = MINIMUM_COHORT_SIZE
): (T & { suppressed?: boolean })[] {
    return data.map((item) => ({
        ...item,
        count: item.count < threshold ? 0 : item.count,
        suppressed: item.count < threshold && item.count > 0,
    }));
}

/**
 * Returns true if a dataset is safe to display.
 * A dataset with all suppressed values should show a privacy notice instead.
 */
export function isDatasetSafeToDisplay<T extends { count: number }>(
    data: T[],
    threshold: number = MINIMUM_COHORT_SIZE
): boolean {
    const visiblePoints = data.filter((d) => d.count >= threshold);
    return visiblePoints.length > 0;
}
