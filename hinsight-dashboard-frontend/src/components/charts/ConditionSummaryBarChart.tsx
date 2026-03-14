import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { IConditionSummaryDataPoint } from '../../types/dashboard.types';
import { useSettingsContext } from '../../context/SettingsContext';
import { TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';
import { formatMetricDisplay } from '../../utils/formatters';

interface ConditionSummaryBarChartProps {
    data: IConditionSummaryDataPoint[];
}

const PALETTE = [
    '#4B4D6D', '#5B5EA6', '#7B6FA0', '#4EADA0',
    '#E8896A', '#6B6E94', '#32344A', '#9CA3AF',
];

const ConditionSummaryBarChart = ({ data }: ConditionSummaryBarChartProps) => {
    const { reduceMotion, dataDisplayMode } = useSettingsContext();
    return (
    <ResponsiveContainer width="100%" height={280}>
        <BarChart
            data={data}
            margin={{ top: 0, right: 16, bottom: 60, left: 0 }}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
                dataKey="condition"
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
                formatter={(value: number | undefined) => [formatMetricDisplay(value ?? 0, dataDisplayMode, TOTAL_EMPLOYEES), 'Employees']}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion}>
                {data.map((_unused, index) => (
                    <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                ))}
            </Bar>
        </BarChart>
    </ResponsiveContainer>
    );
};

export default ConditionSummaryBarChart;
