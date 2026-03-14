import { IHelpContent } from '../types/help.types';

const MOCK_HELP_CONTENT: IHelpContent = {
    contentVersion: '2025-01',
    lastUpdatedAt: '2025-01-15T00:00:00.000Z',
    glossary: [
        { code: 'slp', fullName: 'Sleep', category: 'CONTRIBUTING_FACTOR', description: 'Employees reporting poor sleep quality or insufficient sleep duration (< 7 hours/night).', relatedView: 'lifestyle', relatedMetrics: ['CF_slp_Count', 'CF_slp_risk_Count'] },
        { code: 'dep', fullName: 'Depression', category: 'CONTRIBUTING_FACTOR', description: 'Employees with clinical depression indicators or self-reported symptoms meeting diagnostic criteria.', relatedView: 'feelings', relatedMetrics: ['CF_dep_Count', 'CF_dep_risk_Count'] },
        { code: 'smk', fullName: 'Smoking', category: 'CONTRIBUTING_FACTOR', description: 'Current smokers (daily or occasional) in the enrolled workforce population.', relatedView: 'lifestyle', relatedMetrics: ['CF_smk_Count', 'CF_smk_risk_Count'] },
        { code: 'str', fullName: 'Stress', category: 'CONTRIBUTING_FACTOR', description: 'Employees reporting elevated or severe occupational or personal stress levels.', relatedView: 'feelings', relatedMetrics: ['CF_str_Count', 'CF_str_risk_Count'] },
        { code: 'mvm', fullName: 'Movement', category: 'CONTRIBUTING_FACTOR', description: 'Employees with insufficient physical activity (< 150 min/week moderate intensity).', relatedView: 'lifestyle', relatedMetrics: ['CF_mvm_Count', 'CF_mvm_risk_Count'] },
        { code: 'nut', fullName: 'Nutrition', category: 'CONTRIBUTING_FACTOR', description: 'Employees with poor dietary habits or nutritional deficiencies per programme screening.', relatedView: 'nutrition-obesity', relatedMetrics: ['CF_nut_Count', 'CF_nut_risk_Count'] },
        { code: 'wel', fullName: 'Wellness', category: 'CONTRIBUTING_FACTOR', description: 'Overall wellness score — composite of all contributing factor assessments.', relatedView: 'overview', relatedMetrics: ['CF_wel_Count'] },
        { code: 'obe', fullName: 'Obesity', category: 'CONTRIBUTING_FACTOR', description: 'Employees with BMI ≥ 30 or waist circumference exceeding clinical thresholds.', relatedView: 'nutrition-obesity', relatedMetrics: ['CF_obe_Count', 'CF_obe_risk_Count'] },
        { code: 'T2d', fullName: 'Type 2 Diabetes', category: 'CHRONIC_DISEASE', description: 'Employees with diagnosed or at-risk Type 2 Diabetes based on programme health data.', relatedView: 'overview', relatedMetrics: ['D_T2d_Count', 'D_T2d_risk_Count'] },
        { code: 'CVD', fullName: 'Cardiovascular Disease', category: 'CHRONIC_DISEASE', description: 'Aggregated count of employees with diagnosed cardiovascular disease conditions.', relatedView: 'lifestyle', relatedMetrics: ['D_CVD_Count', 'D_CVD_risk_Count'] },
        { code: 'CKD', fullName: 'Chronic Kidney Disease', category: 'CHRONIC_DISEASE', description: 'Employees with CKD stages 1–5 identified through programme clinical data.', relatedView: 'overview', relatedMetrics: ['D_CKD_Count', 'D_CKD_risk_Count'] },
        { code: 'CanC', fullName: 'Cancer', category: 'CHRONIC_DISEASE', description: 'Employees with active or prior cancer diagnoses. Subject to stricter k-anonymity suppression.', relatedView: 'overview', relatedMetrics: ['D_CanC_Count'] },
        { code: 'MI', fullName: 'Mental Illness', category: 'CHRONIC_DISEASE', description: 'Diagnosed mental health conditions beyond depression (anxiety, PTSD, bipolar, etc.).', relatedView: 'feelings', relatedMetrics: ['D_MI_Count', 'D_MI_risk_Count'] },
        { code: 'Osteo', fullName: 'Osteoporosis', category: 'CHRONIC_DISEASE', description: 'Employees with osteoporosis or osteopenia identified through programme bone density screening.', relatedView: 'overview', relatedMetrics: ['D_Osteo_Count'] },
    ],
    metricDefinitions: [
        { metricId: 'wellbeing_overview_bar', displayName: 'Wellbeing Overview', chartType: 'Bar Chart', description: 'Horizontal bar chart showing the count of employees affected by each contributing factor.', dataSource: 'CF_*_Count variables', aggregationMethod: 'Sum of CF_*_Count across enrolled cohort', regulatoryRationale: 'HIPAA §164.514(b): aggregated counts do not identify individuals. Minimum cohort size (k=10) enforced.', appearsOn: ['overview', 'lifestyle', 'nutrition-obesity', 'feelings'] },
        { metricId: 'condition_summary_bar', displayName: 'Condition Summary', chartType: 'Bar Chart', description: 'Vertical bar chart showing employee distribution across chronic disease conditions.', dataSource: 'D_*_Count variables', aggregationMethod: 'Count of employees with each chronic disease code, sorted descending', regulatoryRationale: 'Population-level counts only. No individual case data exposed.', appearsOn: ['overview', 'nutrition-obesity'] },
        { metricId: 'severity_box_plot', displayName: 'Severity of Suffering', chartType: 'Box Plot (ComposedChart)', description: 'Box plot showing the distribution of self-reported severity scores per contributing factor (min, Q1, median, Q3, max).', dataSource: 'CF_*_severity variables', aggregationMethod: 'Population quartile statistics — never individual scores', regulatoryRationale: 'Statistical distributions cannot identify individuals when cohort ≥ 10.', appearsOn: ['lifestyle', 'feelings'] },
        { metricId: 'improvement_rate_donut', displayName: 'Improvement Rates', chartType: 'Donut Chart (RadialBar)', description: 'Donut chart showing the percentage of enrolled employees who demonstrated improvement per contributing factor over the programme period.', dataSource: 'CF_*_improvement_rate computed variables', aggregationMethod: 'Improvement count / Eligible cohort × 100', regulatoryRationale: 'Improvement rates are program effectiveness metrics — no individual health outcomes exposed.', appearsOn: ['overview', 'nutrition-obesity'] },
        { metricId: 'improvement_wellbeing_bar', displayName: 'Improvement vs Wellbeing', chartType: 'ComposedChart (Bar + Line)', description: 'Overlay chart showing total affected counts (bar) against improvement rates (line) per factor.', dataSource: 'CF_*_Count + CF_*_improvement_rate', aggregationMethod: 'Dual-axis population aggregation', regulatoryRationale: 'Composite view of program effectiveness at population level. No PHI.', appearsOn: ['lifestyle'] },
    ],
    faq: [
        { id: 'faq-001', question: 'Why are some data points showing zero?', answer: 'When fewer than 10 employees make up a category, the data is suppressed per HIPAA and PHIPA k-anonymity requirements. This prevents re-identification of individuals even from aggregated data. A suppression notice will appear when this occurs.', category: 'DATA_INTERPRETATION' },
        { id: 'faq-002', question: 'Can I see individual employee data?', answer: 'No. HINSIGHT is designed exclusively for population-level aggregated metrics. Individual employee health data is never accessible through this dashboard, even to System Administrators. This is a fundamental architectural decision rooted in HIPAA §164.514 and PHIPA §12.', category: 'PRIVACY_COMPLIANCE' },
        { id: 'faq-003', question: 'What does "improvement rate" mean?', answer: 'The improvement rate for a factor (e.g., Sleep) represents the percentage of enrolled employees who showed measurable positive change in that factor between their initial and most recent programme assessment. A higher rate means the wellness programme is having a positive effect on that metric.', category: 'DATA_INTERPRETATION' },
        { id: 'faq-004', question: 'How often is the dashboard data refreshed?', answer: 'Aggregated metrics are refreshed every 24 hours. If data is older than 24 hours, a DATA_STALENESS alert will appear in the Alerts tab. The "Last updated" timestamp on each dashboard view shows the exact time of the most recent refresh.', category: 'TECHNICAL' },
        { id: 'faq-005', question: 'What is the difference between Canadian and US data?', answer: 'Canadian employees are governed by PHIPA (Personal Health Information Protection Act, Ontario). U.S. employees are governed by HIPAA. Both regions share the same k-anonymity threshold (10) and the same dashboard interface, but data is physically stored in region-specific data centres.', category: 'PRIVACY_COMPLIANCE' },
        { id: 'faq-006', question: 'Who can acknowledge alerts?', answer: 'Executives can view alerts but cannot formally acknowledge them. Wellness Managers and Program Managers can acknowledge alerts. System Administrators can dismiss all alerts. This permission structure ensures that governance actions are taken by operationally responsible roles.', category: 'GENERAL' },
    ],
    regulatoryNotices: [
        { id: 'notice-hipaa', framework: 'HIPAA', title: 'Health Insurance Portability and Accountability Act (HIPAA) — Privacy & Security Rules', summary: 'HINSIGHT complies with HIPAA §164.308 (Security Management), §164.312 (Technical Safeguards), and §164.514 (De-identification). All data displayed is de-identified aggregated population statistics. No Protected Health Information (PHI) is transmitted or stored in this dashboard.', fullPolicyUrl: 'https://www.hhs.gov/hipaa/for-professionals/privacy/index.html', applicableRegions: ['US'], lastReviewedAt: '2025-01-01' },
        { id: 'notice-phipa', framework: 'PHIPA', title: 'Personal Health Information Protection Act (PHIPA) — Ontario', summary: 'HINSIGHT complies with PHIPA requirements for health information custodians operating in Ontario, Canada. Aggregated, de-identified population metrics do not constitute "personal health information" under PHIPA §4 when no individual can be identified. K-anonymity (k≥10) is enforced on all outputs.', fullPolicyUrl: 'https://www.ontario.ca/laws/statute/04p03', applicableRegions: ['CA'], lastReviewedAt: '2025-01-01' },
        { id: 'notice-pipeda', framework: 'PIPEDA', title: 'Personal Information Protection and Electronic Documents Act (PIPEDA)', summary: 'For federal-jurisdiction employers in Canada, HINSIGHT\'s data practices comply with PIPEDA accountability, consent, and safeguard principles. Aggregated analytics serve a legitimate business purpose and do not involve collection of identifiable personal information.', fullPolicyUrl: 'https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/', applicableRegions: ['CA'], lastReviewedAt: '2025-01-01' },
    ],
    keyboardShortcuts: [
        { keys: ['Alt', '1'], description: 'Navigate to Overview', context: 'Global' },
        { keys: ['Alt', '2'], description: 'Navigate to Lifestyle', context: 'Global' },
        { keys: ['Alt', '3'], description: 'Navigate to Nutrition & Obesity', context: 'Global' },
        { keys: ['Alt', '4'], description: 'Navigate to Feelings', context: 'Global' },
        { keys: ['Alt', 'A'], description: 'Navigate to Alerts', context: 'Global' },
        { keys: ['Alt', 'D'], description: 'Toggle dark / light mode', context: 'Global' },
        { keys: ['Alt', 'H'], description: 'Navigate to Help', context: 'Global' },
        { keys: ['Alt', 'R'], description: 'Refresh alert feed', context: 'Global' },
        { keys: ['Alt', 'S'], description: 'Navigate to Settings', context: 'Global' },
    ],
};

export async function fetchHelpContent(): Promise<IHelpContent> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return MOCK_HELP_CONTENT;
}
