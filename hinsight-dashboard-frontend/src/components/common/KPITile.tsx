import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';
import { useSettingsContext } from '../../context/SettingsContext';
import { TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';
import { formatMetricDisplay } from '../../utils/formatters';

interface KPITileProps {
    label: string;
    value: number;
    percentage?: number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: ReactNode;
    className?: string;
}

const KPITile = ({ label, value, percentage, trend = 'neutral', icon, className }: KPITileProps) => {
    const { dataDisplayMode } = useSettingsContext();
    const TrendIcon =
        trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

    const trendColor = clsx({
        'text-rose-500': trend === 'up',
        'text-emerald-500': trend === 'down',
        'text-gray-400': trend === 'neutral',
    });

    const displayValue = formatMetricDisplay(value, dataDisplayMode, TOTAL_EMPLOYEES, percentage);

    return (
        <div
            className={clsx(
                'bg-card-light dark:bg-card-dark rounded-card shadow-card',
                'flex items-center gap-3 p-4 min-w-[130px]',
                className
            )}
        >
            {icon && (
                <span className="text-brand dark:text-brand-light text-2xl">{icon}</span>
            )}
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-brand dark:text-brand-light">
                    {displayValue}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                    {label}
                </span>
            </div>
            <TrendIcon className={clsx('w-4 h-4 ml-auto shrink-0', trendColor)} />
        </div>
    );
};

export default KPITile;
