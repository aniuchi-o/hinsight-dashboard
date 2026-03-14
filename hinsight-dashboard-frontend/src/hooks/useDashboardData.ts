import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../services/dashboardService';
import { IDashboardViewData } from '../types/dashboard.types';

export function useDashboardData(view: string) {
    return useQuery<IDashboardViewData>({
        queryKey: ['dashboard', view],
        queryFn: () => fetchDashboardData(view),
        staleTime: 5 * 60 * 1000,
    });
}
