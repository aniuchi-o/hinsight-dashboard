import { IAlertFilters } from '../../types/alerts.types';

interface AlertFilterBarProps {
    filters: IAlertFilters;
    onFilterChange: (updated: Partial<IAlertFilters>) => void;
    // Mark All actions — only rendered when provided (i.e. user has acknowledge permission)
    onMarkAllRead?: () => void;
    onMarkAllUnread?: () => void;
    isMarkingAllRead?: boolean;
    isMarkingAllUnread?: boolean;
}

const SEVERITY_OPTIONS = ['ALL', 'Critical', 'Warning', 'Informational'] as const;
const VIEW_OPTIONS = [
    { value: 'ALL', label: 'All Views' },
    { value: 'overview', label: 'Overview' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'nutrition_obesity', label: 'Nutrition & Obesity' },
    { value: 'feelings', label: 'Feelings' },
    { value: 'system', label: 'System' },
] as const;

const selectClass =
    'text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 ' +
    'bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-brand/50';

const AlertFilterBar = ({
    filters, onFilterChange,
    onMarkAllRead, onMarkAllUnread,
    isMarkingAllRead = false, isMarkingAllUnread = false,
}: AlertFilterBarProps) => (
    <div className="flex flex-wrap items-center gap-3 p-3
                  bg-card-light dark:bg-card-dark rounded-card shadow-card">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filter:</span>

        <select
            value={filters.severity}
            onChange={(e) => onFilterChange({ severity: e.target.value as IAlertFilters['severity'] })}
            className={selectClass}
            aria-label="Filter by severity"
        >
            {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Severities' : s}</option>
            ))}
        </select>

        <select
            value={filters.relatedView ?? 'ALL'}
            onChange={(e) =>
                onFilterChange({
                    relatedView: e.target.value === 'ALL'
                        ? 'ALL'
                        : (e.target.value as IAlertFilters['relatedView']),
                })
            }
            className={selectClass}
            aria-label="Filter by dashboard view"
        >
            {VIEW_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
            ))}
        </select>

        {/* Mark All buttons — immediately before "Show acknowledged" */}
        {onMarkAllRead && (
            <button
                onClick={onMarkAllRead}
                disabled={isMarkingAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                           bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                           border border-gray-200 dark:border-gray-700
                           rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                           transition-colors disabled:opacity-50"
                aria-label="Mark all alerts as read"
            >
                Mark All Read
            </button>
        )}
        {onMarkAllUnread && (
            <button
                onClick={onMarkAllUnread}
                disabled={isMarkingAllUnread}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                           bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400
                           border border-gray-200 dark:border-gray-700
                           rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                           transition-colors disabled:opacity-50"
                aria-label="Mark all alerts as unread"
            >
                Mark All Unread
            </button>
        )}

        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer ml-auto">
            <input
                type="checkbox"
                checked={filters.showAcknowledged}
                onChange={(e) => onFilterChange({ showAcknowledged: e.target.checked })}
                className="accent-brand"
            />
            Show acknowledged
        </label>
    </div>
);

export default AlertFilterBar;
