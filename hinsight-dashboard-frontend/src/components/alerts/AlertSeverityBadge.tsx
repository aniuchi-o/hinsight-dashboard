import clsx from 'clsx';
import { AlertSeverity } from '../../types/alerts.types';

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
    CRITICAL: 'bg-rose-100  dark:bg-rose-900/30  text-rose-700  dark:text-rose-400',
    WARNING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    INFORMATIONAL: 'bg-blue-100  dark:bg-blue-900/30  text-blue-700  dark:text-blue-400',
};

const AlertSeverityBadge = ({ severity }: { severity: AlertSeverity }) => (
    <span
        className={clsx(
            'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
            SEVERITY_STYLES[severity]
        )}
    >
        {severity}
    </span>
);

export default AlertSeverityBadge;
