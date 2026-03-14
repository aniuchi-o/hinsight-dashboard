import { useSettingsContext } from '../../context/SettingsContext';
import { TOTAL_EMPLOYEES } from '../../utils/mockDashboardData';

interface HinsightKPITileProps {
    label: string;
    current: number;
    previous: number;
    percentage?: number;
    icon: string; // Material Icon name
}

const HinsightKPITile = ({ label, current, previous, percentage, icon }: HinsightKPITileProps) => {
    const { dataDisplayMode } = useSettingsContext();
    const isWorsening = current > previous;
    const isImproving = current < previous;

    const pct = percentage ?? Math.round((current / TOTAL_EMPLOYEES) * 1000) / 10;
    const displayValue =
        dataDisplayMode === 'COUNTS_AND_PERCENTAGES'
            ? `${current.toLocaleString()} (${pct.toFixed(1)}%)`
            : dataDisplayMode === 'PERCENTAGES_ONLY'
              ? `${pct.toFixed(1)}%`
              : current.toLocaleString();

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4 flex items-center gap-3 min-w-[140px]">
            <span
                className="material-icons text-[32px] text-brand/30 dark:text-brand-light/30"
                aria-hidden="true"
            >
                {icon}
            </span>
            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-brand dark:text-white">{displayValue}</span>
                    {isWorsening && (
                        <span
                            className="material-icons text-[18px] text-rose-500"
                            aria-label="Worsening"
                        >
                            arrow_upward
                        </span>
                    )}
                    {isImproving && (
                        <span
                            className="material-icons text-[18px] text-emerald-500"
                            aria-label="Improving"
                        >
                            arrow_downward
                        </span>
                    )}
                    {!isWorsening && !isImproving && (
                        <span
                            className="material-icons text-[18px] text-gray-400"
                            aria-label="Unchanged"
                        >
                            remove
                        </span>
                    )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{label}</span>
            </div>
        </div>
    );
};

export default HinsightKPITile;
