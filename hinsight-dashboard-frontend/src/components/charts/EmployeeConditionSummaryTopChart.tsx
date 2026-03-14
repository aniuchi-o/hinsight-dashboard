import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { CHART_COLORS } from '../../utils/chartColors';
import { FACTOR_CONDITION_COUNTS, TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';
import { formatMetricDisplay } from '../../utils/formatters';

interface Props {
    searchQuery: string;
    activeFactors: string[];
    factors: string[]; // page-specific factors
}

const EmployeeConditionSummaryTopChart = ({ activeFactors, factors, searchQuery }: Props) => {
    const { theme } = useTheme();
    const { reduceMotion, dataDisplayMode } = useSettingsContext();
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#E5E7EB' : '#111827';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tooltipBg = isDark ? '#252640' : '#FFFFFF';
    const tooltipText = isDark ? '#E5E7EB' : '#111827';
    const tooltipBorder = isDark ? '#4B4D6D' : '#E5E7EB';

    // Build data: one entry per unique condition, with current (confirmed) and atRisk bars
    const conditions = Array.from(
        new Set(
            FACTOR_CONDITION_COUNTS
                .filter(d => factors.includes(d.factor))
                .map(d => d.condition)
        )
    );

    const data = conditions.map(condition => {
        const entries = FACTOR_CONDITION_COUNTS.filter(
            d => factors.includes(d.factor) && d.condition === condition
        );
        const current = entries.reduce((s, e) => s + e.current, 0);
        const baseline = entries.reduce((s, e) => s + e.baseline, 0);
        const isActive =
            (activeFactors.length === 0 && !searchQuery.trim()) ||
                searchQuery.trim()
                ? condition.toLowerCase().includes(searchQuery.toLowerCase())
                : activeFactors.some(f => entries.some(e => e.factor === f));
        return { condition, current, baseline, isActive };
    });

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-brand dark:text-white mb-3">Employee Condition Summary</h3>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} barCategoryGap="30%" barGap={2}>
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
                        domain={[0, 12]}
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
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, color: axisColor }}
                    />
                    <Bar dataKey="current" name="Living with condition" radius={[3, 3, 0, 0]} isAnimationActive={!reduceMotion}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={`cur-${idx}`}
                                fill={entry.isActive
                                    ? (isDark ? CHART_COLORS.activeDark : CHART_COLORS.active)
                                    : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                            />
                        ))}
                    </Bar>
                    <Bar dataKey="baseline" name="At risk of condition" radius={[3, 3, 0, 0]} isAnimationActive={!reduceMotion}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={`base-${idx}`}
                                fill={entry.isActive
                                    ? (isDark ? '#8B8DB8' : CHART_COLORS.atRisk)
                                    : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Dual-series chart showing employees confirmed to be living with each chronic condition
                (purple) alongside those identified as at risk of developing it (light purple).
            </p>
        </div>
    );
};

export default EmployeeConditionSummaryTopChart;
