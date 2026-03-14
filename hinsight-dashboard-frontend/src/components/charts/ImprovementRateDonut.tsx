import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { IImprovementRate } from '../../types/dashboard.types';
import { useSettingsContext } from '../../context/SettingsContext';

interface ImprovementRateDonutProps {
    data: IImprovementRate[];
}

const renderLabel = (props: PieLabelRenderProps): string => {
    const factor = typeof props.name === 'string' ? props.name : '';
    const rate = typeof props.value === 'number' ? props.value : 0;
    return `${factor}: ${rate}%`;
};

const ImprovementRateDonut = ({ data }: ImprovementRateDonutProps) => {
    const { reduceMotion } = useSettingsContext();
    return (
    <ResponsiveContainer width="100%" height={280}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                dataKey="rate"
                nameKey="factor"
                label={renderLabel}
                labelLine={false}
                isAnimationActive={!reduceMotion}
            >
                {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip
                formatter={(value: unknown) => [
                    `${typeof value === 'number' ? value : 0}%`,
                    'Improvement Rate',
                ]}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{value}</span>
                )}
            />
        </PieChart>
    </ResponsiveContainer>
    );
};

export default ImprovementRateDonut;
