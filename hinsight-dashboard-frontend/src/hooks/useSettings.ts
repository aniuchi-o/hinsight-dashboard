import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserSettings, updatePreferences, acceptCompliance } from '../services/settingsService';
import { IUserSettings, IUpdatePreferencesPayload, IAcceptCompliancePayload } from '../types/settings.types';

export function useUserSettings() {
    return useQuery<IUserSettings>({
        queryKey: ['settings'],
        queryFn: fetchUserSettings,
        staleTime: 10 * 60 * 1000,
    });
}

export function useUpdatePreferences() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, IUpdatePreferencesPayload>({
        mutationFn: updatePreferences,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
}

export function useAcceptCompliance() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, IAcceptCompliancePayload>({
        mutationFn: acceptCompliance,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
}
