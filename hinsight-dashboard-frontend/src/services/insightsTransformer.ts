/**
 * insightsTransformer.ts
 *
 * Maps the raw /api/v1/insights response → IDashboardViewData.
 * Skeleton implementation — exact field mappings will be finalized once
 * the backend RBAC grants access to the insights endpoint.
 */
import type {
    IDashboardViewData,
    IKPIMetrics,
    IContributingFactorCounts,
} from '../types/dashboard.types';

/* eslint-disable @typescript-eslint/no-explicit-any */

const FACTOR_NAMES = {
    sleep: 'Sleep',
    nutrition: 'Nutrition',
    stress: 'Stress',
    depression: 'Depression',
    smoke: 'Smoke',
    obesity: 'Obesity',
    wellness: 'Wellness',
    movement: 'Movement',
} as const;

const IMPROVEMENT_COLORS = ['#4EADA0', '#5B5EA6', '#7B6FA0', '#E8896A', '#4B4D6D', '#6B6E94', '#5E8FD5', '#7F8A5A'];

type FactorKey = keyof typeof FACTOR_NAMES;

const factorKeys: FactorKey[] = Object.keys(FACTOR_NAMES) as FactorKey[];

function getCategoryCount(byCategory: Record<string, number>, factor: FactorKey): number {
    return byCategory[factor] ?? 0;
}

/**
 * Best-effort transform of the raw insights payload.
 * The backend schema is `additionalProperties: true`, so we
 * map known fields and provide safe defaults for missing ones.
 */
export function transformInsightsResponse(raw: any): IDashboardViewData {
    const byCategory = (raw?.by_category ?? {}) as Record<string, number>;
    const totalRecords = Number(raw?.total_records ?? 0);

    const wellbeing: IContributingFactorCounts = {
        sleep: 0, depression: 0, smoke: 0, stress: 0,
        nutrition: 0, movement: 0, wellness: 0, obesity: 0,
    };
    for (const f of factorKeys) wellbeing[f] = getCategoryCount(byCategory, f);

    const kpis: IKPIMetrics = {
        totalEmployees: totalRecords,
        sleepCount: wellbeing.sleep,
        nutritionCount: wellbeing.nutrition,
        stressCount: wellbeing.stress,
        depressionCount: wellbeing.depression,
        smokeCount: wellbeing.smoke,
        obesityCount: wellbeing.obesity,
        movementCount: wellbeing.movement,
        wellnessCount: wellbeing.wellness,
    };

    const conditionSummary = factorKeys.map((factor) => ({
        condition: FACTOR_NAMES[factor],
        count: wellbeing[factor],
        factor: FACTOR_NAMES[factor],
    }));

    const employeesWithConditions = factorKeys.map((factor) => ({
        condition: FACTOR_NAMES[factor],
        count: wellbeing[factor],
    }));

    const severityOfSuffering = factorKeys.map((factor) => {
        const count = wellbeing[factor];
        const min = 1;
        const q1 = count > 0 ? 2 : 0;
        const median = count > 0 ? 4 : 0;
        const q3 = count > 0 ? 6 : 0;
        const max = count > 0 ? 8 : 0;
        return { factor: FACTOR_NAMES[factor], min, q1, median, q3, max };
    });

    const improvementRates = factorKeys.map((factor, index) => {
        const rate = totalRecords > 0 ? Math.round((wellbeing[factor] / totalRecords) * 100) : 0;
        return {
            factor: FACTOR_NAMES[factor],
            rate,
            color: IMPROVEMENT_COLORS[index % IMPROVEMENT_COLORS.length],
        };
    });

    return {
        kpis,
        wellbeingOverview: wellbeing,
        conditionSummary,
        employeesWithConditions,
        severityOfSuffering,
        improvementRates,
        lastUpdatedAt: raw?.last_updated_at ?? new Date().toISOString(),
    };
}
