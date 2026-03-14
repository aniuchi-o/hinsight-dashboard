import { useCallback } from 'react';
import { RefreshCw, CheckCheck } from 'lucide-react';
import { useAlerts, useAcknowledgeAlert, useMarkAllAlertsRead, useMarkAllAlertsUnread } from '../hooks/useAlerts';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import AlertFeedItem from '../components/alerts/AlertFeedItem';
import AlertFilterBar from '../components/alerts/AlertFilterBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { IAlertFilters } from '../types/alerts.types';
import clsx from 'clsx';

const DEFAULT_FILTERS: IAlertFilters = {
    severity: 'ALL',
    type: 'ALL',
    relatedView: 'ALL',
    showAcknowledged: false,
    showDismissed: false,
};

const AlertsPage = () => {
    const { hasPermission } = useAuth();
    const [filters, setFilters] = useState<IAlertFilters>(DEFAULT_FILTERS);
    const canAcknowledge = hasPermission('action:alerts:acknowledge');

    const { data, isLoading, isError, refetch, isFetching } = useAlerts(filters);
    const acknowledgeMutation = useAcknowledgeAlert();
    const markAllReadMutation = useMarkAllAlertsRead();
    const markAllUnreadMutation = useMarkAllAlertsUnread();

    const handleFilterChange = useCallback((updated: Partial<IAlertFilters>) => {
        setFilters((prev) => ({ ...prev, ...updated }));
    }, []);

    const handleAcknowledge = useCallback((alertId: string) => {
        if (!canAcknowledge) return;
        acknowledgeMutation.mutate({ alertId });
    }, [canAcknowledge, acknowledgeMutation]);

    const handleMarkAllRead = useCallback(() => {
        if (!canAcknowledge) return;
        markAllReadMutation.mutate();
    }, [canAcknowledge, markAllReadMutation]);

    const handleMarkAllUnread = useCallback(() => {
        const total = data?.alerts.length ?? 0;
        markAllUnreadMutation.mutate(total);
    }, [data?.alerts.length, markAllUnreadMutation]);

    return (
        <div className="min-h-full p-6 space-y-4">
            {/* Page header — title only */}
            <div className="px-6 pt-4 pb-2">
                <h1 className="text-2xl font-bold text-brand dark:text-white">
                    Alerts
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Population-level threshold notifications — no individual health data
                </p>
            </div>

            <div className="px-6 space-y-4">
                {/* Refresh row */}
                <div className="flex items-center justify-end gap-2">
                    {data && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            Last refreshed: {new Date(data.lastRefreshedAt).toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm
                                   bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light
                                   rounded-lg hover:bg-brand/20 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={clsx(isFetching && 'animate-spin')} />
                        Refresh
                    </button>
                </div>

                {/* HIPAA notice */}
                <div className="bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-card px-4 py-3 text-xs text-brand dark:text-brand-light">
                    <strong>Data minimization notice:</strong> All alerts reflect aggregated population-level metrics only.
                    No individual employee health information is exposed. Cohorts of fewer than 10 employees are suppressed
                    per HIPAA/PHIPA k-anonymity requirements.
                </div>

                {/* Severity summary tiles */}
                {data && (
                    <div className="grid grid-cols-3 gap-4">
                        {([
                            { label: 'Critical', sev: 'CRITICAL' as const, color: 'border-rose-500 text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                            { label: 'Warning', sev: 'WARNING' as const, color: 'border-amber-500 text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                            { label: 'Informational', sev: 'INFORMATIONAL' as const, color: 'border-blue-500 text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        ]).map(({ label, sev, color, bg }) => (
                            <div key={label} className={clsx('rounded-card border-l-4 p-4 shadow-card flex items-center justify-between', color, bg)}>
                                <span className="text-sm font-medium">{label}</span>
                                <span className="text-2xl font-bold">
                                    {data.alerts.filter((a) => a.severity === sev && !a.isAcknowledged).length}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filter bar — Mark All buttons are rendered inside it, before "Show acknowledged" */}
                <AlertFilterBar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onMarkAllRead={canAcknowledge ? handleMarkAllRead : undefined}
                    onMarkAllUnread={canAcknowledge ? handleMarkAllUnread : undefined}
                    isMarkingAllRead={markAllReadMutation.isPending}
                    isMarkingAllUnread={markAllUnreadMutation.isPending}
                />

                {isLoading && <LoadingSpinner />}
                {isError && <div className="text-center py-12 text-rose-500">Failed to load alerts. Please refresh.</div>}
                {data && data.alerts.length === 0 && (
                    <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                        <CheckCheck size={40} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No active alerts matching your filters.</p>
                    </div>
                )}
                {data && data.alerts.length > 0 && (
                    <div className="space-y-3">
                        {data.alerts.map((alert) => (
                            <AlertFeedItem
                                key={alert.id}
                                alert={alert}
                                canAcknowledge={canAcknowledge}
                                onAcknowledge={handleAcknowledge}
                                isAcknowledging={
                                    acknowledgeMutation.isPending &&
                                    acknowledgeMutation.variables?.alertId === alert.id
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertsPage;
