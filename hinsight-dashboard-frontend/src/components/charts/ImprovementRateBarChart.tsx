import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { CHART_COLORS } from '../../utils/chartColors';
import { IMPROVEMENT_RATES, TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';
import { formatMetricDisplay } from '../../utils/formatters';

interface Props {
    searchQuery: string;
    activeFactors: string[];
    factors?: string[]; // filter to specific factors
    title?: string;
}

const ImprovementRateBarChart = ({ activeFactors, factors, title = 'Improvement rate for well-being factors' }: Props) => {
    const { theme } = useTheme();
    const { reduceMotion, dataDisplayMode } = useSettingsContext();
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#E5E7EB' : '#111827';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tooltipBg = isDark ? '#252640' : '#FFFFFF';
    const tooltipText = isDark ? '#E5E7EB' : '#111827';
    const tooltipBorder = isDark ? '#4B4D6D' : '#E5E7EB';

    const allFactors = Object.keys(IMPROVEMENT_RATES.byFactor) as Array<keyof typeof IMPROVEMENT_RATES.byFactor>;

    const filteredFactors = factors
        ? allFactors.filter(f => factors.includes(f))
        : allFactors;

    const data = filteredFactors.map(factor => {
        const d = IMPROVEMENT_RATES.byFactor[factor];
        const isActive = activeFactors.length === 0 || activeFactors.includes(factor);
        return {
            factor,
            current: d.count,
            baseline: d.baseline,
            isActive,
        };
    });

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-brand dark:text-white mb-3">{title}</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} barCategoryGap="30%" barGap={2}>
                    <CartesianGrid vertical={false} stroke={gridColor} />
                    <XAxis
                        dataKey="factor"
                        angle={0}
                        textAnchor="middle"
                        interval={0}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        axisLine={{ stroke: axisColor }}
                        tickLine={{ stroke: axisColor }}
                    />
                    <YAxis
                        domain={[0, 700]}
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
                    <Bar dataKey="current" name="Improved (current)" radius={[3, 3, 0, 0]} isAnimationActive={!reduceMotion}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={`cur-${idx}`}
                                fill={entry.isActive
                                    ? (isDark ? CHART_COLORS.activeDark : CHART_COLORS.active)
                                    : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                            />
                        ))}
                    </Bar>
                    <Bar dataKey="baseline" name="Baseline" radius={[3, 3, 0, 0]} isAnimationActive={!reduceMotion}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={`base-${idx}`}
                                fill={entry.isActive
                                    ? CHART_COLORS.baseline
                                    : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Tracks the improvement in employee count per contributing factor (purple = current
                improved count, salmon = previous baseline). Higher current bars indicate positive intervention outcomes.
            </p>
        </div>
    );
};

export default ImprovementRateBarChart;
