import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { CHART_COLORS } from '../../utils/chartColors';
import { FACTOR_CONDITION_MAP } from '../../utils/factorConditionMap';
import { FACTOR_CONDITION_COUNTS, TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';
import { formatMetricDisplay } from '../../utils/formatters';

interface Props {
    searchQuery: string;
    factors: string[]; // page-specific dropdown options
}

const EmployeeConditionSummaryFilteredChart = ({ searchQuery, factors }: Props) => {
    const { theme } = useTheme();
    const { reduceMotion, dataDisplayMode } = useSettingsContext();
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#E5E7EB' : '#111827';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tooltipBg = isDark ? '#252640' : '#FFFFFF';
    const tooltipText = isDark ? '#E5E7EB' : '#111827';
    const tooltipBorder = isDark ? '#4B4D6D' : '#E5E7EB';

    const [selectedFactor, setSelectedFactor] = useState(factors[0] ?? '');

    const mappedConditions = FACTOR_CONDITION_MAP[selectedFactor] ?? [];

    const data = mappedConditions.map(condition => {
        const entry = FACTOR_CONDITION_COUNTS.find(
            d => d.factor === selectedFactor && d.condition === condition
        );
        const isActive = !searchQuery.trim() || condition.toLowerCase().includes(searchQuery.toLowerCase());
        return {
            condition,
            value: entry?.current ?? 0,
            isActive,
        };
    });

    const isEmpty = mappedConditions.length === 0;

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-brand dark:text-white">Employee Condition Summary</h3>
                <select
                    aria-label="Select contributing factor"
                    value={selectedFactor}
                    onChange={(e) => setSelectedFactor(e.target.value)}
                    className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1
                               bg-white dark:bg-[#2A2B45] text-gray-700 dark:text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                    {factors.map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>

            {isEmpty ? (
                <div className="h-[180px] flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 italic">
                    No condition associations defined for this factor.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={data} barCategoryGap="40%">
                        <CartesianGrid vertical={false} stroke={gridColor} />
                        <XAxis
                            dataKey="condition"
                            angle={0}
                            textAnchor="middle"
                            interval={0}
                            tick={{ fill: axisColor, fontSize: 9 }}
                            axisLine={{ stroke: axisColor }}
                            tickLine={{ stroke: axisColor }}
                        />
                        <YAxis
                            domain={[0, 16]}
                            tick={{ fill: axisColor, fontSize: 11 }}
                            axisLine={{ stroke: axisColor }}
                            tickLine={{ stroke: axisColor }}
                        />
                        <Tooltip
                            formatter={(value: unknown) => [
                                typeof value === 'number'
                                    ? formatMetricDisplay(value, dataDisplayMode, TOTAL_EMPLOYEES)
                                    : '0',
                                'Employees',
                            ]}
                            contentStyle={{
                                backgroundColor: tooltipBg,
                                border: `1px solid ${tooltipBorder}`,
                                borderRadius: 8,
                                fontSize: 12,
                                color: tooltipText,
                            }}
                            itemStyle={{ color: tooltipText }}
                            labelStyle={{ color: tooltipText }}
                        />
                        <Bar dataKey="value" name="Employees" radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion}>
                            {data.map((entry, idx) => (
                                <Cell
                                    key={`cell-${idx}`}
                                    fill={entry.isActive
                                        ? (isDark ? CHART_COLORS.activeDark : CHART_COLORS.active)
                                        : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Filters to show only the chronic conditions linked to the selected contributing factor.
                Use the dropdown to explore condition associations for each factor.
            </p>
        </div>
    );
};

export default EmployeeConditionSummaryFilteredChart;
