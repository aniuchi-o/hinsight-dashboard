import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { CHART_COLORS } from '../../utils/chartColors';
import { EMPLOYEES_WITH_CONDITIONS_DATA, TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';
import { formatMetricDisplay } from '../../utils/formatters';

interface Props {
    searchQuery: string;
    activeFactors: string[];
}

const EmployeesWithConditionsChart = ({ searchQuery }: Props) => {
    const { theme } = useTheme();
    const { reduceMotion, dataDisplayMode } = useSettingsContext();
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#E5E7EB' : '#111827';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tooltipBg = isDark ? '#252640' : '#FFFFFF';
    const tooltipText = isDark ? '#E5E7EB' : '#111827';
    const tooltipBorder = isDark ? '#4B4D6D' : '#E5E7EB';

    const data = EMPLOYEES_WITH_CONDITIONS_DATA.map(d => {
        const isActive = !searchQuery.trim() || d.condition.toLowerCase().includes(searchQuery.toLowerCase());
        return { ...d, isActive };
    });

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-brand dark:text-white mb-3">Employees With Conditions</h3>
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
                        domain={[0, 10]}
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
                    <Bar dataKey="confirmed" name="Confirmed" radius={[3, 3, 0, 0]} isAnimationActive={!reduceMotion}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={`confirmed-${idx}`}
                                fill={entry.isActive
                                    ? (isDark ? CHART_COLORS.activeDark : CHART_COLORS.active)
                                    : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                            />
                        ))}
                    </Bar>
                    <Bar dataKey="atRisk" name="At Risk" radius={[3, 3, 0, 0]} isAnimationActive={!reduceMotion}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={`atRisk-${idx}`}
                                fill={entry.isActive
                                    ? (isDark ? '#8B8DB8' : CHART_COLORS.atRisk)
                                    : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Shows the number of employees confirmed to be living with each chronic condition
                alongside those identified as at risk of developing it.
            </p>
        </div>
    );
};

export default EmployeesWithConditionsChart;
