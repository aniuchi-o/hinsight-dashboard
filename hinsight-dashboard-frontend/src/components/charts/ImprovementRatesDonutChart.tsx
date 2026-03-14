import { useState } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { CHART_COLORS } from '../../utils/chartColors';
import { FACTOR_CONDITION_MAP } from '../../utils/factorConditionMap';
import { IMPROVEMENT_RATES } from '../../utils/mockDashboardData';

interface Props {
    searchQuery: string;
    factors: string[]; // page-specific factors
}

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({
    cx, cy, midAngle, outerRadius, value, fill,
}: PieLabelRenderProps) => {
    const cxNum = Number(cx ?? 0);
    const cyNum = Number(cy ?? 0);
    const midAngleNum = Number(midAngle ?? 0);
    const outerRadiusNum = Number(outerRadius ?? 80);
    const valueNum = Number(value ?? 0);
    const radius = outerRadiusNum + 24;
    const x = cxNum + radius * Math.cos(-midAngleNum * RADIAN);
    const y = cyNum + radius * Math.sin(-midAngleNum * RADIAN);
    return (
        <text
            x={x} y={y}
            fill={String(fill ?? '#4B4D6D')}
            textAnchor={x > cxNum ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={11}
            fontWeight={600}
        >
            {valueNum}
        </text>
    );
};

const ImprovementRatesDonutChart = ({ searchQuery, factors }: Props) => {
    const { theme } = useTheme();
    const { reduceMotion } = useSettingsContext();
    const isDark = theme === 'dark';
    const tooltipBg = isDark ? '#252640' : '#FFFFFF';
    const tooltipText = isDark ? '#E5E7EB' : '#111827';
    const tooltipBorder = isDark ? '#4B4D6D' : '#E5E7EB';

    const [selectedFactor, setSelectedFactor] = useState('All Factors');

    const options = ['All Factors', ...factors];

    // Which factors to show segments for
    const visibleFactors: string[] =
        selectedFactor === 'All Factors'
            ? factors
            : FACTOR_CONDITION_MAP[selectedFactor]?.length
                ? [selectedFactor]
                : [selectedFactor];

    const data = visibleFactors
        .filter(f => f in IMPROVEMENT_RATES.byFactor)
        .map(factor => {
            const d = IMPROVEMENT_RATES.byFactor[factor as keyof typeof IMPROVEMENT_RATES.byFactor];
            const isHighlighted = !searchQuery.trim() || factor.toLowerCase().includes(searchQuery.toLowerCase());
            return {
                name: factor,
                value: d.count,
                color: CHART_COLORS.donut[factor as keyof typeof CHART_COLORS.donut] ?? '#9B9DC8',
                isHighlighted,
            };
        })
        .filter(d => d.value > 0);

    const tooltipStyle = {
        backgroundColor: tooltipBg,
        border: `1px solid ${tooltipBorder}`,
        borderRadius: 8,
        fontSize: 12,
        color: tooltipText,
    };

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-brand dark:text-white">Improvement Rates</h3>
                <select
                    aria-label="Select factor for improvement rates"
                    value={selectedFactor}
                    onChange={(e) => setSelectedFactor(e.target.value)}
                    className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1
                               bg-white dark:bg-[#2A2B45] text-gray-700 dark:text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-brand/30"
                >
                    {options.map(o => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
            </div>

            {data.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-xs text-gray-400 dark:text-gray-500 italic">
                    No improvement data available for this selection.
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                labelLine={false}
                                label={renderCustomLabel}
                                isAnimationActive={!reduceMotion}
                            >
                                {data.map((entry, idx) => (
                                    <Cell
                                        key={`cell-${idx}`}
                                        fill={entry.isHighlighted ? entry.color : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                                        stroke="none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={tooltipStyle}
                                itemStyle={{ color: tooltipText }}
                                labelStyle={{ color: tooltipText }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Legend — two column layout */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        {data.map(entry => (
                            <div key={entry.name} className="flex items-center gap-1.5">
                                <span
                                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                    style={{ background: entry.color }}
                                />
                                <span
                                    className="text-xs truncate"
                                    style={{
                                        color: entry.isHighlighted
                                            ? entry.color
                                            : (isDark ? '#6B7280' : '#9CA3AF'),
                                        fontWeight: entry.isHighlighted ? 600 : 400,
                                    }}
                                >
                                    {entry.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Donut chart showing the improvement count per contributing factor. Numbers indicate
                the absolute employee improvement count. Select a factor from the dropdown to focus the view.
            </p>
        </div>
    );
};

export default ImprovementRatesDonutChart;
