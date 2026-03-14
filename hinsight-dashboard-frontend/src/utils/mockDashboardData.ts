import type { IDashboardViewData } from '../types/dashboard.types';

// Measurement 1: Contributing factor counts (suffering + at-risk)
export const CONTRIBUTING_FACTOR_COUNTS = {
    Sleep: { suffering: 10, atRisk: 10 },
    Nutrition: { suffering: 7, atRisk: 7 },
    Smoke: { suffering: 6, atRisk: 6 },
    Stress: { suffering: 5, atRisk: 5 },
    Depression: { suffering: 3, atRisk: 3 },
    Obesity: { suffering: 14, atRisk: 8 },
    Wellness: { suffering: 1, atRisk: 4 },
    Movement: { suffering: 12, atRisk: 6 },
};

// For KPI tiles — current count + previous count (drives arrow direction)
export const KPI_TILE_DATA: Record<string, { current: number; previous: number }> = {
    Sleep: { current: 14, previous: 12 },
    Nutrition: { current: 3, previous: 5 },
    Stress: { current: 10, previous: 11 },
    Depression: { current: 7, previous: 6 },
    Smoke: { current: 1, previous: 2 },
    Obesity: { current: 14, previous: 13 },
    Wellness: { current: 1, previous: 3 },
    Movement: { current: 12, previous: 10 },
};

// Measurement 2: Chronic condition counts (confirmed + at-risk)
export const CHRONIC_CONDITION_COUNTS = {
    Hypertension: { confirmed: 8, atRisk: 8 },
    ChronicKidneyDisease: { confirmed: 5, atRisk: 5 },
    Cancer: { confirmed: 3, atRisk: 3 },
    Type2Diabetes: { confirmed: 3, atRisk: 3 },
    Type1Diabetes: { confirmed: 4, atRisk: 4 },
    Arrythmia: { confirmed: 2, atRisk: 3 },
};

// Measurements 3, 4, 5: Factor-to-condition employee counts
export const FACTOR_CONDITION_COUNTS = [
    { factor: 'Sleep', condition: 'Hypertension', current: 4, baseline: 6 },
    { factor: 'Nutrition', condition: 'Type 1 Diabetes', current: 3, baseline: 5 },
    { factor: 'Smoke', condition: 'Type 1 Diabetes', current: 2, baseline: 4 },
    { factor: 'Stress', condition: 'Type 1 Diabetes', current: 2, baseline: 3 },
    { factor: 'Stress', condition: 'Cancer', current: 1, baseline: 2 },
    { factor: 'Depression', condition: 'Chronic Kidney Disease', current: 2, baseline: 3 },
    { factor: 'Depression', condition: 'Type 2 Diabetes', current: 2, baseline: 4 },
    { factor: 'Obesity', condition: 'Cancer', current: 1, baseline: 3 },
];

// Measurement 6: Severity of suffering
export const SEVERITY_DATA = [
    { factor: 'Sleep', important: 7, veryImportant: 3 },
    { factor: 'Nutrition', important: 5, veryImportant: 2 },
    { factor: 'Smoke', important: 3, veryImportant: 3 },
    { factor: 'Stress', important: 0, veryImportant: 5 },
    { factor: 'Depression', important: 1, veryImportant: 2 },
    { factor: 'Obesity', important: 6, veryImportant: 4 },
    { factor: 'Wellness', important: 2, veryImportant: 1 },
    { factor: 'Movement', important: 5, veryImportant: 3 },
];

// Measurements 7, 8, 9, 10: Improvement rates
export const IMPROVEMENT_RATES = {
    byConditionAndFactor: [
        { condition: 'Type 1 Diabetes', factor: 'Sleep', rate: 30 },
        { condition: 'Arrythmia', factor: 'Sleep', rate: 20 },
        { condition: 'Hypertension', factor: 'Nutrition', rate: 10 },
    ],
    byFactor: {
        Sleep: { rate: 40, count: 395, baseline: 320 },
        Nutrition: { rate: 30, count: 659, baseline: 580 },
        Smoke: { rate: 15, count: 96, baseline: 110 },
        Stress: { rate: 5, count: 164, baseline: 190 },
        Depression: { rate: 5, count: 278, baseline: 300 },
        Obesity: { rate: 20, count: 464, baseline: 420 },
        Wellness: { rate: 25, count: 390, baseline: 350 },
        Movement: { rate: 35, count: 446, baseline: 390 },
    },
};

// Pre-existing conditions data (Measurement 3)
export const PRE_EXISTING_DATA = [
    { factor: 'Sleep', current: 8, baseline: 10 },
    { factor: 'Nutrition', current: 5, baseline: 7 },
    { factor: 'Smoke', current: 4, baseline: 6 },
    { factor: 'Stress', current: 6, baseline: 8 },
    { factor: 'Depression', current: 3, baseline: 5 },
    { factor: 'Obesity', current: 9, baseline: 11 },
    { factor: 'Wellness', current: 2, baseline: 4 },
    { factor: 'Movement', current: 7, baseline: 9 },
];

// Wellbeing overview data (Measurement 1) — suffering + at-risk per factor
export const WELLBEING_OVERVIEW_DATA = [
    { factor: 'Stress', suffering: 5, atRisk: 5 },
    { factor: 'Sleep', suffering: 10, atRisk: 10 },
    { factor: 'Smoke', suffering: 6, atRisk: 6 },
    { factor: 'Nutrition', suffering: 7, atRisk: 7 },
    { factor: 'Movement', suffering: 12, atRisk: 6 },
    { factor: 'Obesity', suffering: 14, atRisk: 8 },
    { factor: 'Wellness', suffering: 1, atRisk: 4 },
    { factor: 'Depression', suffering: 3, atRisk: 3 },
];

// Employees with conditions (Measurement 2 — condition counts)
export const EMPLOYEES_WITH_CONDITIONS_DATA = [
    { condition: 'Hypertension', confirmed: 8, atRisk: 8 },
    { condition: 'Chronic Kidney Disease', confirmed: 5, atRisk: 5 },
    { condition: 'Cancer', confirmed: 3, atRisk: 3 },
    { condition: 'Type 2 Diabetes', confirmed: 3, atRisk: 3 },
    { condition: 'Type 1 Diabetes', confirmed: 4, atRisk: 4 },
    { condition: 'Arrythmia', confirmed: 2, atRisk: 3 },
];

export let TOTAL_EMPLOYEES = 70;

const FACTOR_NAME_BY_KEY = {
    sleep: 'Sleep',
    nutrition: 'Nutrition',
    stress: 'Stress',
    depression: 'Depression',
    smoke: 'Smoke',
    obesity: 'Obesity',
    wellness: 'Wellness',
    movement: 'Movement',
} as const;

const CONDITION_LABELS = [
    'Hypertension',
    'Chronic Kidney Disease',
    'Cancer',
    'Type 2 Diabetes',
    'Type 1 Diabetes',
    'Arrythmia',
];

export function applyDashboardDataToMock(data: IDashboardViewData): void {
    TOTAL_EMPLOYEES = data.kpis.totalEmployees;

    const kpiByFactor: Record<string, number> = {
        Sleep: data.kpis.sleepCount,
        Nutrition: data.kpis.nutritionCount,
        Stress: data.kpis.stressCount,
        Depression: data.kpis.depressionCount,
        Smoke: data.kpis.smokeCount,
        Obesity: data.kpis.obesityCount,
        Wellness: data.kpis.wellnessCount,
        Movement: data.kpis.movementCount,
    };

    for (const [factor, count] of Object.entries(kpiByFactor)) {
        if (CONTRIBUTING_FACTOR_COUNTS[factor as keyof typeof CONTRIBUTING_FACTOR_COUNTS]) {
            CONTRIBUTING_FACTOR_COUNTS[factor as keyof typeof CONTRIBUTING_FACTOR_COUNTS] = {
                suffering: count,
                atRisk: 0,
            };
        }

        if (KPI_TILE_DATA[factor]) {
            KPI_TILE_DATA[factor] = {
                current: count,
                previous: Math.max(0, count - 1),
            };
        }

        const preExisting = PRE_EXISTING_DATA.find((row) => row.factor === factor);
        if (preExisting) {
            preExisting.current = count;
            preExisting.baseline = Math.max(count, preExisting.baseline);
        }

        const severity = SEVERITY_DATA.find((row) => row.factor === factor);
        if (severity) {
            severity.important = Math.max(0, Math.round(count * 0.7));
            severity.veryImportant = Math.max(0, count - severity.important);
        }

        const factorKey = factor as keyof typeof IMPROVEMENT_RATES.byFactor;
        if (IMPROVEMENT_RATES.byFactor[factorKey]) {
            const rateEntry = data.improvementRates.find((r) => r.factor === factor);
            IMPROVEMENT_RATES.byFactor[factorKey] = {
                rate: rateEntry?.rate ?? 0,
                count,
                baseline: Math.max(0, count - 1),
            };
        }
    }

    WELLBEING_OVERVIEW_DATA.splice(
        0,
        WELLBEING_OVERVIEW_DATA.length,
        ...Object.entries(FACTOR_NAME_BY_KEY).map(([key, factor]) => {
            const count = data.wellbeingOverview[key as keyof typeof FACTOR_NAME_BY_KEY] ?? 0;
            return {
                factor,
                suffering: count,
                atRisk: 0,
            };
        })
    );

    const conditionSummaryCounts = [...data.conditionSummary]
        .sort((a, b) => b.count - a.count)
        .slice(0, CONDITION_LABELS.length);

    EMPLOYEES_WITH_CONDITIONS_DATA.splice(
        0,
        EMPLOYEES_WITH_CONDITIONS_DATA.length,
        ...CONDITION_LABELS.map((label, index) => {
            const count = conditionSummaryCounts[index]?.count ?? 0;
            const confirmed = Math.max(0, Math.round(count * 0.65));
            const atRisk = Math.max(0, count - confirmed);
            return {
                condition: label,
                confirmed,
                atRisk,
            };
        })
    );
}
