import { useState, useMemo } from 'react';
import PageTopBar from '../components/common/PageTopBar';
import HinsightKPITile from '../components/common/HinsightKPITile';
import WellbeingOverviewChart from '../components/charts/WellbeingOverviewChart';
import EmployeesWithConditionsChart from '../components/charts/EmployeesWithConditionsChart';
import PreExistingConditionsChart from '../components/charts/PreExistingConditionsChart';
import ImprovementRateBarChart from '../components/charts/ImprovementRateBarChart';
import { useDashboardData } from '../hooks/useDashboardData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PAGE_FACTORS } from '../utils/factorConditionMap';

const FACTOR_ICONS: Record<string, string> = {
    Sleep: 'bedtime',
    Nutrition: 'restaurant',
    Stress: 'psychology',
    Depression: 'sentiment_very_dissatisfied',
    Smoke: 'smoking_rooms',
    Obesity: 'monitor_weight',
    Wellness: 'self_improvement',
    Movement: 'directions_run',
};

const OVERVIEW_FACTORS = PAGE_FACTORS.overview;

const OverviewPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data, isLoading, isError } = useDashboardData('overview');
    const activeFactors = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return OVERVIEW_FACTORS.filter(f => f.toLowerCase().includes(q));
    }, [searchQuery]);

    if (isLoading) return <LoadingSpinner />;
    if (isError || !data) return <div className="p-6 text-sm text-rose-500">Unable to load overview data.</div>;

    return (
        <div className="min-h-full p-6 space-y-4">
            <PageTopBar
                title="Overview"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                employeeCount={data.kpis.totalEmployees}
            />

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 px-6 leading-relaxed max-w-4xl">
                This dashboard provides an aggregated overview of your workforce's well-being across all eight
                contributing factors. Use the charts below to identify trends, compare risk levels, and prioritise
                wellness interventions. All data is population-level and fully de-identified.
            </p>

            {/* KPI Tiles — 2 rows of 4 */}
            <div className="px-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(() => {
                    const KPI_FACTOR_MAP: Record<string, number> = {
                        Sleep: data.kpis.sleepCount,
                        Nutrition: data.kpis.nutritionCount,
                        Stress: data.kpis.stressCount,
                        Depression: data.kpis.depressionCount,
                        Smoke: data.kpis.smokeCount,
                        Obesity: data.kpis.obesityCount,
                        Wellness: data.kpis.wellnessCount,
                        Movement: data.kpis.movementCount,
                    };
                    return OVERVIEW_FACTORS.map(factor => (
                        <HinsightKPITile
                            key={factor}
                            label={factor}
                            current={KPI_FACTOR_MAP[factor] ?? 0}
                            previous={Math.max(0, (KPI_FACTOR_MAP[factor] ?? 0) - 1)}
                            icon={FACTOR_ICONS[factor]}
                        />
                    ));
                })()}
            </div>

            {/* Charts — two column layout */}
            <div className="px-6 grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Left column — 40% */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <PreExistingConditionsChart
                        searchQuery={searchQuery}
                        activeFactors={activeFactors}
                        title="Number of Employees with Pre-Existing Health Conditions"
                    />
                    <ImprovementRateBarChart
                        searchQuery={searchQuery}
                        activeFactors={activeFactors}
                        title="Improvement rate for each well-being factor"
                    />
                    {/* Chart 3: Improvement rates severity = important */}
                    <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
                        <h3 className="text-sm font-semibold text-brand dark:text-white mb-3">Improvement rates severity = important</h3>
                        <ImprovementRateBarChart
                            searchQuery={searchQuery}
                            activeFactors={activeFactors}
                            title=""
                        />
                        {/* Two-column factor legend */}
                        <div className="grid grid-cols-2 gap-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Stress / Movement</span>
                            <span>Smoke / Wellness</span>
                            <span>Sleep / Obesity</span>
                            <span>Nutrition / Depression</span>
                        </div>
                    </div>
                </div>

                {/* Right column — 60% */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <WellbeingOverviewChart
                        searchQuery={searchQuery}
                        activeFactors={activeFactors}
                    />
                    <EmployeesWithConditionsChart
                        searchQuery={searchQuery}
                        activeFactors={activeFactors}
                    />
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
