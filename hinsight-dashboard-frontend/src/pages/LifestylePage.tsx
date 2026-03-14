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
    Sleep: 'bedtime',
    Smoke: 'smoking_rooms',
    Movement: 'directions_run',
    Nutrition: 'restaurant',
};

const PAGE_KEY = 'lifestyle';
const FACTORS = PAGE_FACTORS[PAGE_KEY];
const KPI_FACTORS = ['Smoke', 'Sleep', 'Movement', 'Nutrition'];

const LifestylePage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { data, isLoading, isError } = useDashboardData('lifestyle');
    const activeFactors = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return FACTORS.filter(f => f.toLowerCase().includes(q));
    }, [searchQuery]);

    if (isLoading) return <LoadingSpinner />;
    if (isError || !data) return <div className="p-6 text-sm text-rose-500">Unable to load lifestyle data.</div>;

    const KPI_FACTOR_MAP: Record<string, number> = {
        Sleep: data.kpis.sleepCount,
        Nutrition: data.kpis.nutritionCount,
        Smoke: data.kpis.smokeCount,
        Movement: data.kpis.movementCount,
    };

    return (
        <div className="min-h-full p-6 space-y-4">
            <PageTopBar
                title="Lifestyle"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                employeeCount={data.kpis.totalEmployees}
            />

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 px-6 leading-relaxed max-w-4xl">
                The Lifestyle view focuses on Smoke, Sleep, Movement, and Nutrition — the behavioural
                contributing factors most linked to chronic condition risk in your workforce. Use this page
                to assess severity distribution and track improvement rates across these factors.
            </p>

            {/* Main grid: left KPI column + right charts */}
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
                        {/* Left charts */}
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

                        {/* Right charts */}
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

export default LifestylePage;
