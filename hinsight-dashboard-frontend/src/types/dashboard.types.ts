// Contributing Factors (CF_*_Count variables)
export interface IContributingFactorCounts {
    sleep: number;
    depression: number;
    smoke: number;
    stress: number;
    nutrition: number;
    movement: number;
    wellness: number;
    obesity: number;
}

export interface IRiskCounts extends IContributingFactorCounts { }

// Chronic Diseases (D_*_Count variables)
export interface IChronicDiseaseCounts {
    type2Diabetes: number;
    cvd: number;
    ckd: number;
    cancer: number;
    mentalIllness: number;
    osteoporosis: number;
}

export interface IDiseaseRiskCounts extends IChronicDiseaseCounts { }

// KPI Tile data — aggregated counts shown in the top row
export interface IKPIMetrics {
    totalEmployees: number;
    sleepCount: number;
    nutritionCount: number;
    stressCount: number;
    depressionCount: number;
    smokeCount: number;
    obesityCount: number;
    movementCount: number;
    wellnessCount: number;
}

// Severity data for box-plot / bar charts
export interface ISeverityDataPoint {
    factor: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
}

// Improvement rate for donut chart
export interface IImprovementRate {
    factor: string;
    rate: number;
    color: string;
}

// Employee condition summary bar data
export interface IConditionSummaryDataPoint {
    condition: string;
    count: number;
    factor?: string;
}

// Top-level aggregated response for each dashboard view
export interface IDashboardViewData {
    kpis: IKPIMetrics;
    conditionSummary: IConditionSummaryDataPoint[];
    employeesWithConditions: IConditionSummaryDataPoint[];
    severityOfSuffering: ISeverityDataPoint[];
    improvementRates: IImprovementRate[];
    wellbeingOverview: IContributingFactorCounts;
    lastUpdatedAt: string;
}

/**
 * AGGREGATION GUARD: k-anonymity minimum cohort size.
 */
export const MINIMUM_COHORT_SIZE = 10;
