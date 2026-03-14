import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { IImprovementRate, IContributingFactorCounts } from '../../types/dashboard.types';
import { useSettingsContext } from '../../context/SettingsContext';

interface ImprovementWellbeingBarChartProps {
    wellbeing: IContributingFactorCounts;
    improvements: IImprovementRate[];
}

const ImprovementWellbeingBarChart = ({
    wellbeing,
    improvements,
}: ImprovementWellbeingBarChartProps) => {
    const { reduceMotion } = useSettingsContext();
    const factorMap: Record<string, number> = {
        Sleep: wellbeing.sleep,
        Stress: wellbeing.stress,
        Nutrition: wellbeing.nutrition,
        Movement: wellbeing.movement,
        Wellness: wellbeing.wellness,
        Obesity: wellbeing.obesity,
    };

    const chartData = improvements.map((imp) => ({
        name: imp.factor,
        count: factorMap[imp.factor] ?? 0,
        improvement: imp.rate,
    }));

    return (
        <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 8, right: 40, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    yAxisId="count"
                    orientation="left"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    yAxisId="rate"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconSize={8} />
                <Bar yAxisId="count" dataKey="count" fill="#5B5EA6" radius={[4, 4, 0, 0]} name="Employees affected" opacity={0.85} isAnimationActive={!reduceMotion} />
                <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="improvement"
                    stroke="#4EADA0"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#4EADA0' }}
                    name="Improvement rate (%)"
                    isAnimationActive={!reduceMotion}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default ImprovementWellbeingBarChart;
