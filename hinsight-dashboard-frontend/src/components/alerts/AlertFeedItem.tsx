import { useNavigate } from 'react-router-dom';
import { ExternalLink, Check, Clock, ShieldAlert, Info, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { IAlert } from '../../types/alerts.types';
import AlertSeverityBadge from './AlertSeverityBadge';
import { useAlertsContext } from '../../context/AlertsContext';
import { ReactNode } from 'react';

const VIEW_PATHS: Record<string, string> = {
    overview: '/overview',
    lifestyle: '/lifestyle',
    nutrition_obesity: '/nutrition-obesity',
    feelings: '/feelings',
};

const VIEW_LABELS: Record<string, string> = {
    overview: 'Overview',
    lifestyle: 'Lifestyle',
    nutrition_obesity: 'Nutrition and Obesity',
    feelings: 'Feelings',
};

const TYPE_ICONS: Record<IAlert['type'], ReactNode> = {
    THRESHOLD_BREACH: <ShieldAlert size={16} className="text-rose-500" />,
    RISK_SPIKE: <AlertTriangle size={16} className="text-amber-500" />,
    IMPROVEMENT_REGRESSION: <AlertTriangle size={16} className="text-amber-500" />,
    DATA_STALENESS: <Clock size={16} className="text-blue-400" />,
    COHORT_SUPPRESSION: <Info size={16} className="text-blue-400" />,
    SYSTEM_NOTICE: <Info size={16} className="text-gray-400" />,
};

interface AlertFeedItemProps {
    alert: IAlert;
    canAcknowledge: boolean;
    onAcknowledge: (id: string) => void;
    isAcknowledging: boolean;
}

const AlertFeedItem = ({ alert, canAcknowledge, onAcknowledge, isAcknowledging }: AlertFeedItemProps) => {
    const navigate = useNavigate();
    const { decrementUnread } = useAlertsContext();

    const handleAcknowledge = () => {
        // Optimistic: decrement badge immediately before API resolves
        decrementUnread();
        onAcknowledge(alert.id);
    };

    const handleViewInPage = () => {
        if (canAcknowledge && !alert.isAcknowledged) {
            handleAcknowledge();
        }
        navigate(VIEW_PATHS[alert.relatedView ?? ''] ?? '/overview');
    };

    return (
        <div
            className={clsx(
                'bg-card-light dark:bg-card-dark rounded-card shadow-card p-4 border-l-4 transition-opacity',
                alert.severity === 'CRITICAL' && 'border-rose-500',
                alert.severity === 'WARNING' && 'border-amber-500',
                alert.severity === 'INFORMATIONAL' && 'border-blue-400',
                alert.isAcknowledged && 'opacity-60'
            )}
        >
            <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">{TYPE_ICONS[alert.type]}</span>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {alert.title}
                        </span>
                        <AlertSeverityBadge severity={alert.severity} />
                        {alert.isAcknowledged && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Acknowledged by {alert.acknowledgedByRole?.replace('_', ' ')}
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {alert.description}
                    </p>

                    {alert.affectedValue !== null && alert.thresholdValue !== null && (
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span>
                                Affected:{' '}
                                <strong className="text-gray-700 dark:text-gray-200">
                                    {alert.affectedValue} employees
                                </strong>
                                {alert.percentageOfWorkforce !== null && (
                                    <span> ({alert.percentageOfWorkforce.toFixed(1)}% of workforce)</span>
                                )}
                            </span>
                            <span>
                                Threshold:{' '}
                                <strong className="text-gray-700 dark:text-gray-200">
                                    {alert.thresholdValue}
                                </strong>
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-400">
                            {new Date(alert.createdAt).toLocaleString()}
                        </span>
                        {alert.relatedView && alert.relatedView !== 'system' && (
                            <button
                                onClick={handleViewInPage}
                                className="text-[11px] text-brand dark:text-brand-light hover:underline flex items-center gap-1"
                            >
                                View in {VIEW_LABELS[alert.relatedView] || alert.relatedView.replace('_', ' ')}
                                <ExternalLink size={10} />
                            </button>
                        )}
                    </div>
                </div>

                {canAcknowledge && !alert.isAcknowledged && (
                    <button
                        onClick={handleAcknowledge}
                        disabled={isAcknowledging}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs
                                   bg-emerald-50 dark:bg-emerald-900/20
                                   text-emerald-700 dark:text-emerald-400
                                   border border-emerald-200 dark:border-emerald-700
                                   rounded-lg hover:bg-emerald-100 transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={12} />
                        Acknowledge
                    </button>
                )}
            </div>
        </div>
    );
};

export default AlertFeedItem;
