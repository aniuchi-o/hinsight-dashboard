import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { CHART_COLORS } from '../../utils/chartColors';
import { SEVERITY_DATA } from '../../utils/mockDashboardData';

interface Props {
    searchQuery: string;
    activeFactors: string[];
    factors?: string[];
    title?: string;
}

const SeverityChart = ({ activeFactors, factors, title = 'Severity of suffering' }: Props) => {
    const { theme } = useTheme();
    const { reduceMotion } = useSettingsContext();
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#E5E7EB' : '#111827';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tooltipBg = isDark ? '#252640' : '#FFFFFF';
    const tooltipText = isDark ? '#E5E7EB' : '#111827';
    const tooltipBorder = isDark ? '#4B4D6D' : '#E5E7EB';

    const filteredData = (factors
        ? SEVERITY_DATA.filter(d => factors.includes(d.factor))
        : SEVERITY_DATA
    ).map(d => ({
        ...d,
        isActive: activeFactors.length === 0 || activeFactors.includes(d.factor),
    }));

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-brand dark:text-white mb-3">{title}</h3>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={filteredData} barCategoryGap="30%" barGap={2}>
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
                        domain={[0, 12]}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        axisLine={{ stroke: axisColor }}
                        tickLine={{ stroke: axisColor }}
                    />
                    <Tooltip
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
                    <Bar dataKey="important" name="Important" radius={[3, 3, 0, 0]} isAnimationActive={!reduceMotion}>
                        {filteredData.map((entry, idx) => (
                            <Cell
                                key={`imp-${idx}`}
                                fill={entry.isActive
                                    ? (isDark ? CHART_COLORS.activeDark : CHART_COLORS.active)
                                    : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                            />
                        ))}
                    </Bar>
                    <Bar dataKey="veryImportant" name="Very Important" radius={[3, 3, 0, 0]} isAnimationActive={!reduceMotion}>
                        {filteredData.map((entry, idx) => (
                            <Cell
                                key={`veryImp-${idx}`}
                                fill={entry.isActive
                                    ? CHART_COLORS.baseline
                                    : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Breaks down employee severity by "Important" (purple) and "Very Important" (salmon) thresholds per factor.
                Factors with high "Very Important" scores require priority wellness interventions.
            </p>
        </div>
    );
};

export default SeverityChart;
