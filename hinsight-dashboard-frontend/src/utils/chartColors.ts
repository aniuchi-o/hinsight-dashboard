export const CHART_COLORS = {
    inactive: '#D1D3E0',
    active: '#5B5EA6',
    baseline: '#E8896A',
    atRisk: '#9B9DC8',
    inactiveDark: '#3A3B55',
    activeDark: '#7B7EBF',
    donut: {
        Sleep: '#5B5EA6',
        Nutrition: '#E8896A',
        Smoke: '#4EADA0',
        Stress: '#F5C07A',
        Depression: '#9B9DC8',
        Obesity: '#E87A8A',
        Wellness: '#7BC8A4',
        Movement: '#6AADE8',
    },
} as const;

export type DonutFactor = keyof typeof CHART_COLORS.donut;
