import {
    ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ErrorBar
} from 'recharts';
import { ISeverityDataPoint } from '../../types/dashboard.types';
import { useSettingsContext } from '../../context/SettingsContext';

interface SeverityBoxPlotProps {
    data: ISeverityDataPoint[];
}

const SeverityBoxPlot = ({ data }: SeverityBoxPlotProps) => {
    const { reduceMotion } = useSettingsContext();
    // Recharts doesn't have native box plot — simulate using Bar (IQR) + ErrorBar (whiskers)
    const chartData = data.map((d) => ({
        name: d.factor,
        // Bar runs from Q1 to Q3 — we use the bottom value as base
        iqrBottom: d.q1,
        iqrHeight: d.q3 - d.q1,
        errorLow: d.q1 - d.min,    // whisker below
        errorHigh: d.max - d.q3,   // whisker above
    }));

    return (
        <ResponsiveContainer width="100%" height={280}>
            <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 10]}
                    label={{ value: 'Severity (1–10)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9CA3AF' } }}
                />
                <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: unknown, name: unknown) => {
                        const labels: Record<string, string> = {
                            iqrHeight: 'IQR (Q1–Q3)',
                            iqrBottom: 'Q1 Base',
                        };
                        const nameStr = typeof name === 'string' ? name : '';
                        const numVal = typeof value === 'number' ? value : 0;
                        return [numVal, labels[nameStr] ?? nameStr];
                    }}
                />
                {/* IQR box */}
                <Bar dataKey="iqrHeight" stackId="box" fill="#5B5EA6" opacity={0.7} radius={[4, 4, 0, 0]} isAnimationActive={!reduceMotion}>
                    <ErrorBar dataKey="errorLow" width={4} strokeWidth={2} stroke="#4B4D6D" direction="y" />
                </Bar>
                {/* Invisible base to offset bar to Q1 */}
                <Bar dataKey="iqrBottom" stackId="box" fill="transparent" isAnimationActive={!reduceMotion} />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default SeverityBoxPlot;
