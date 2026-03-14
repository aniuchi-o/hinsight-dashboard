import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { IContributingFactorCounts } from '../../types/dashboard.types';
import { useSettingsContext } from '../../context/SettingsContext';
import { TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';
import { formatMetricDisplay } from '../../utils/formatters';

interface WellbeingBarChartProps {
    data: IContributingFactorCounts;
}

const FACTOR_COLORS: Record<string, string> = {
    Sleep: '#4EADA0',
    Depression: '#5B5EA6',
    Smoke: '#E8896A',
    Stress: '#7B6FA0',
    Nutrition: '#4B4D6D',
    Movement: '#6B6E94',
    Wellness: '#4EADA0',
    Obesity: '#E8896A',
};

const WellbeingBarChart = ({ data }: WellbeingBarChartProps) => {
    const { reduceMotion, dataDisplayMode } = useSettingsContext();
    const chartData = [
        { name: 'Sleep', value: data.sleep },
        { name: 'Stress', value: data.stress },
        { name: 'Obesity', value: data.obesity },
        { name: 'Movement', value: data.movement },
        { name: 'Nutrition', value: data.nutrition },
        { name: 'Wellness', value: data.wellness },
        { name: 'Depression', value: data.depression },
        { name: 'Smoke', value: data.smoke },
    ];

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 24, bottom: 0, left: 72 }}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                />
                <Tooltip
                    formatter={(value: unknown) => [
                        typeof value === 'number'
                            ? formatMetricDisplay(value, dataDisplayMode, TOTAL_EMPLOYEES)
                            : '0',
                        'Employees',
                    ]}
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={!reduceMotion}>
                    {chartData.map((entry) => (
                        <Cell key={entry.name} fill={FACTOR_COLORS[entry.name] ?? '#4B4D6D'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default WellbeingBarChart;
