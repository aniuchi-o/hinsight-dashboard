import { useQuery } from '@tanstack/react-query';
import { fetchHelpContent } from '../services/helpService';
import { IHelpContent } from '../types/help.types';

export function useHelpContent() {
    return useQuery<IHelpContent>({
        queryKey: ['help'],
        queryFn: fetchHelpContent,
        staleTime: 60 * 60 * 1000, // 1 hour — static content
    });
}
