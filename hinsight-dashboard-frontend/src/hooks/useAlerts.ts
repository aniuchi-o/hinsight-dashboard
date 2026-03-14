import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchAlerts, acknowledgeAlert, acknowledgeAllAlerts, unacknowledgeAllAlerts } from '../services/alertsService';
import { useAlertsContext } from '../context/AlertsContext';
import { IAlertFilters, IAlertsFeedResponse, IAcknowledgeAlertPayload } from '../types/alerts.types';

export const alertQueryKeys = {
    all: ['alerts'] as const,
    filtered: (filters: IAlertFilters) => ['alerts', filters] as const,
};

export function useAlerts(filters: IAlertFilters) {
    const { setUnreadCount } = useAlertsContext();

    const query = useQuery<IAlertsFeedResponse>({
        queryKey: alertQueryKeys.filtered(filters),
        queryFn: () => fetchAlerts(filters),
        staleTime: 60 * 1000,
    });

    useEffect(() => {
        if (query.data) {
            setUnreadCount(query.data.unreadCount);
        }
    }, [query.data, setUnreadCount]);

    return query;
}

export function useAcknowledgeAlert() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, IAcknowledgeAlertPayload>({
        mutationFn: acknowledgeAlert,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: alertQueryKeys.all });
        },
        onError: () => {
            // On error revert would need a snapshot — for now just re-sync from query
            void queryClient.invalidateQueries({ queryKey: alertQueryKeys.all });
        },
    });
}

export function useMarkAllAlertsRead() {
    const queryClient = useQueryClient();
    const { clearUnread } = useAlertsContext();

    return useMutation<void, Error, void>({
        mutationFn: acknowledgeAllAlerts,
        onMutate: () => {
            clearUnread(); // optimistic
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: alertQueryKeys.all });
        },
    });
}

export function useMarkAllAlertsUnread() {
    const queryClient = useQueryClient();
    const { setUnreadCount } = useAlertsContext();

    return useMutation<void, Error, number>({
        mutationFn: (_totalCount: number) => unacknowledgeAllAlerts(),
        onMutate: (totalCount: number) => {
            setUnreadCount(totalCount); // optimistic
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: alertQueryKeys.all });
        },
    });
}

/**
 * Call this in DashboardShell so the unread badge stays accurate
 * on every page, not just when AlertsPage is mounted.
 */
export function useSyncUnreadCount() {
    const { setUnreadCount } = useAlertsContext();

    const query = useQuery<IAlertsFeedResponse>({
        queryKey: alertQueryKeys.all,
        queryFn: () => fetchAlerts({
            severity: 'ALL',
            type: 'ALL',
            relatedView: 'ALL',
            showAcknowledged: false,
            showDismissed: false,
        }),
        staleTime: 60 * 1000,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        if (query.data) {
            setUnreadCount(query.data.unreadCount);
        }
    }, [query.data, setUnreadCount]);
}
