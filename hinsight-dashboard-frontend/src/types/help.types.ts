/**
 * HELP PAGE TYPE DEFINITIONS
 * All help content is non-PHI — static content for regulatory literacy.
 */

export type ContributingFactorCode =
    | 'slp' | 'dep' | 'smk' | 'str'
    | 'mvm' | 'nut' | 'wel' | 'obe';

export type ChronicDiseaseCode =
    | 'T2d' | 'CVD' | 'CKD' | 'CanC' | 'MI' | 'Osteo';

export interface IGlossaryEntry {
    code: string;
    fullName: string;
    category: 'CONTRIBUTING_FACTOR' | 'CHRONIC_DISEASE';
    description: string;
    relatedView: string;
    relatedMetrics: string[];
}

export interface IMetricDefinition {
    metricId: string;
    displayName: string;
    chartType: string;
    description: string;
    dataSource: string;
    aggregationMethod: string;
    regulatoryRationale: string;
    appearsOn: string[];
}

export interface IFAQItem {
    id: string;
    question: string;
    answer: string;
    category: 'DATA_INTERPRETATION' | 'PRIVACY_COMPLIANCE' | 'TECHNICAL' | 'GENERAL';
    relatedView?: string;
}

export interface IRegulatoryNotice {
    id: string;
    framework: 'HIPAA' | 'PHIPA' | 'PIPEDA' | 'SAMD';
    title: string;
    summary: string;
    fullPolicyUrl: string;
    applicableRegions: ('CA' | 'US')[];
    lastReviewedAt: string;
}

export interface IKeyboardShortcut {
    keys: string[];
    description: string;
    context: string;
}

export interface IHelpContent {
    glossary: IGlossaryEntry[];
    metricDefinitions: IMetricDefinition[];
    faq: IFAQItem[];
    regulatoryNotices: IRegulatoryNotice[];
    keyboardShortcuts: IKeyboardShortcut[];
    lastUpdatedAt: string;
    contentVersion: string;
}
