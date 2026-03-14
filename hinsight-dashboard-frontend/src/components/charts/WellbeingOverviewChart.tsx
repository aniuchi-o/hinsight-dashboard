import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useSettingsContext } from '../../context/SettingsContext';
import { CHART_COLORS } from '../../utils/chartColors';
import { WELLBEING_OVERVIEW_DATA, TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';
import { formatMetricDisplay } from '../../utils/formatters';

interface Props {
    searchQuery: string;
    activeFactors: string[];
}

const GROUPS = [
    ['Stress', 'Sleep'],
    ['Smoke', 'Nutrition'],
    ['Movement', 'Obesity'],
    ['Wellness', 'Depression'],
];

function buildChartData(activeFactors: string[]) {
    return GROUPS.map(([f1, f2]) => {
        const d1 = WELLBEING_OVERVIEW_DATA.find(d => d.factor === f1);
        const d2 = WELLBEING_OVERVIEW_DATA.find(d => d.factor === f2);
        const isActive1 = activeFactors.length === 0 || activeFactors.includes(f1);
        const isActive2 = activeFactors.length === 0 || activeFactors.includes(f2);
        return {
            name: `${f1}/${f2}`,
            f1,
            f2,
            [`${f1}_val`]: (d1?.suffering ?? 0) + (d1?.atRisk ?? 0),
            [`${f2}_val`]: (d2?.suffering ?? 0) + (d2?.atRisk ?? 0),
            active1: isActive1,
            active2: isActive2,
        };
    });
}

const WellbeingOverviewChart = ({ activeFactors }: Props) => {
    const { theme } = useTheme();
    const { reduceMotion, dataDisplayMode } = useSettingsContext();
    const isDark = theme === 'dark';
    const axisColor = isDark ? '#E5E7EB' : '#111827';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tooltipBg = isDark ? '#252640' : '#FFFFFF';
    const tooltipText = isDark ? '#E5E7EB' : '#111827';
    const tooltipBorder = isDark ? '#4B4D6D' : '#E5E7EB';

    const data = buildChartData(activeFactors);

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
            <h3 className="text-sm font-semibold text-brand dark:text-white mb-3">Wellbeing Overview</h3>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data} barCategoryGap="30%" barGap={2}>
                    <CartesianGrid vertical={false} stroke={gridColor} />
                    <XAxis
                        dataKey="name"
                        angle={0}
                        textAnchor="middle"
                        interval={0}
                        tick={{ fill: axisColor, fontSize: 11 }}
                        axisLine={{ stroke: axisColor }}
                        tickLine={{ stroke: axisColor }}
                    />
                    <YAxis
                        domain={[0, 100]}
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
                    {GROUPS.map(([f1, f2]) => [
                        <Bar
                            key={`${f1}_val`}
                            dataKey={`${f1}_val`}
                            name={f1}
                            fill={CHART_COLORS.active}
                            radius={[3, 3, 0, 0]}
                            isAnimationActive={!reduceMotion}
                        >
                            {data.map((entry, idx) => (
                                <Cell
                                    key={`${f1}-${idx}`}
                                    fill={entry.active1
                                        ? (isDark ? CHART_COLORS.activeDark : CHART_COLORS.active)
                                        : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                                />
                            ))}
                        </Bar>,
                        <Bar
                            key={`${f2}_val`}
                            dataKey={`${f2}_val`}
                            name={f2}
                            fill={CHART_COLORS.atRisk}
                            radius={[3, 3, 0, 0]}
                            isAnimationActive={!reduceMotion}
                        >
                            {data.map((entry, idx) => (
                                <Cell
                                    key={`${f2}-${idx}`}
                                    fill={entry.active2
                                        ? (isDark ? '#8B8DB8' : CHART_COLORS.atRisk)
                                        : (isDark ? CHART_COLORS.inactiveDark : CHART_COLORS.inactive)}
                                />
                            ))}
                        </Bar>,
                    ])}
                </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed">
                Displays the total employee count — suffering and at-risk combined — per contributing well-being factor.
                Highlighted bars correspond to factors matching your search.
            </p>
        </div>
    );
};

export default WellbeingOverviewChart;
