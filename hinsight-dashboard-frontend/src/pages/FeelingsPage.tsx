import { useState, useMemo } from 'react';
import PageTopBar from '../components/common/PageTopBar';
import HinsightKPITile from '../components/common/HinsightKPITile';
import PreExistingConditionsChart from '../components/charts/PreExistingConditionsChart';
import SeverityChart from '../components/charts/SeverityChart';
import ImprovementRateBarChart from '../components/charts/ImprovementRateBarChart';
import EmployeeConditionSummaryTopChart from '../components/charts/EmployeeConditionSummaryTopChart';
import EmployeeConditionSummaryFilteredChart from '../components/charts/EmployeeConditionSummaryFilteredChart';
import ImprovementRatesDonutChart from '../components/charts/ImprovementRatesDonutChart';
import { useDashboardData } from '../hooks/useDashboardData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PAGE_FACTORS } from '../utils/factorConditionMap';

const FACTOR_ICONS: Record<string, string> = {
    Wellness: 'self_improvement',
    Stress: 'psychology',
    Depression: 'sentiment_very_dissatisfied',
};

const PAGE_KEY = 'feelings';
const FACTORS = PAGE_FACTORS[PAGE_KEY];
const KPI_FACTORS = ['Wellness', 'Stress', 'Depression'];

const FeelingsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data, isLoading, isError } = useDashboardData('feelings');
    const activeFactors = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return FACTORS.filter(f => f.toLowerCase().includes(q));
    }, [searchQuery]);

    if (isLoading) return <LoadingSpinner />;
    if (isError || !data) return <div className="p-6 text-sm text-rose-500">Unable to load feelings data.</div>;

    const KPI_FACTOR_MAP: Record<string, number> = {
        Wellness: data.kpis.wellnessCount,
        Stress: data.kpis.stressCount,
        Depression: data.kpis.depressionCount,
    };

    return (
        <div className="min-h-full p-6 space-y-4">
            <PageTopBar
                title="Feelings"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                employeeCount={data.kpis.totalEmployees}
            />

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 px-6 leading-relaxed max-w-4xl">
                The Feelings view covers Wellness, Stress, and Depression — the psychological contributing
                factors tracked by HINSIGHT. Use this page to understand the emotional health profile of
                your workforce and identify where interventions are most needed.
            </p>

            {/* Main grid */}
            <div className="px-6 grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Left column: KPI tiles stacked */}
                <div className="lg:col-span-1 flex flex-col gap-3">
                    {KPI_FACTORS.map(factor => (
                        <HinsightKPITile
                            key={factor}
                            label={factor}
                            current={KPI_FACTOR_MAP[factor] ?? 0}
                            previous={Math.max(0, (KPI_FACTOR_MAP[factor] ?? 0) - 1)}
                            icon={FACTOR_ICONS[factor]}
                        />
                    ))}
                </div>

                {/* Right columns: charts */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Top wide chart */}
                    <EmployeeConditionSummaryTopChart
                        searchQuery={searchQuery}
                        activeFactors={activeFactors}
                        factors={FACTORS}
                    />

                    {/* 2-column chart grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-4">
                            <PreExistingConditionsChart
                                searchQuery={searchQuery}
                                activeFactors={activeFactors}
                                factors={FACTORS}
                                title="Employees with pre-existing conditions"
                            />
                            <SeverityChart
                                searchQuery={searchQuery}
                                activeFactors={activeFactors}
                                factors={FACTORS}
                                title="Severity of suffering"
                            />
                            <ImprovementRateBarChart
                                searchQuery={searchQuery}
                                activeFactors={activeFactors}
                                factors={FACTORS}
                                title="Improvement rate for well-being factors"
                            />
                        </div>
                        <div className="flex flex-col gap-4">
                            <EmployeeConditionSummaryFilteredChart
                                searchQuery={searchQuery}
                                factors={FACTORS}
                            />
                            <ImprovementRatesDonutChart
                                searchQuery={searchQuery}
                                factors={FACTORS}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeelingsPage;
