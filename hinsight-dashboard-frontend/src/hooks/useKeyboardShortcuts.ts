import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../context/ThemeContext';

export const useKeyboardShortcuts = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { toggleTheme } = useTheme();

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!e.altKey) return;
            switch (e.key.toUpperCase()) {
                case '1': e.preventDefault(); navigate('/overview'); break;
                case '2': e.preventDefault(); navigate('/lifestyle'); break;
                case '3': e.preventDefault(); navigate('/nutrition-obesity'); break;
                case '4': e.preventDefault(); navigate('/feelings'); break;
                case 'A': e.preventDefault(); navigate('/alerts'); break;
                case 'D': e.preventDefault(); toggleTheme(); break;
                case 'H': e.preventDefault(); navigate('/help'); break;
                case 'R':
                    e.preventDefault();
                    void queryClient.invalidateQueries({ queryKey: ['alerts'] });
                    break;
                case 'S': e.preventDefault(); navigate('/settings'); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [navigate, queryClient, toggleTheme]);
};
