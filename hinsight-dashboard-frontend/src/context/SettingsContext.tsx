import {
    createContext, useContext, useEffect, useState, ReactNode, useCallback
} from 'react';
import { apiClient } from '../services/apiClient';
import type { DataDisplayMode, DefaultDashboardView } from '../types/settings.types';

interface ISettingsContext {
    highContrast: boolean;
    reduceMotion: boolean;
    dataDisplayMode: DataDisplayMode;
    defaultView: DefaultDashboardView;
    setHighContrast: (v: boolean) => void;
    setReduceMotion: (v: boolean) => void;
    setDataDisplayMode: (v: DataDisplayMode) => void;
    setDefaultView: (v: DefaultDashboardView) => void;
    syncFromBackend: () => Promise<void>;
}

const SettingsContext = createContext<ISettingsContext | undefined>(undefined);

const LS_KEY = 'hinsight-settings';

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) return JSON.parse(raw) as Partial<ISettingsContext>;
    } catch { /* ignore */ }
    return {};
}

export const SettingsContextProvider = ({ children }: { children: ReactNode }) => {
    const stored = loadFromStorage();

    const [highContrast, setHighContrastState] = useState<boolean>((stored as { highContrast?: boolean }).highContrast ?? false);
    const [reduceMotion, setReduceMotionState] = useState<boolean>((stored as { reduceMotion?: boolean }).reduceMotion ?? false);
    const [dataDisplayMode, setDataDisplayModeState] = useState<DataDisplayMode>(
        (stored as { dataDisplayMode?: DataDisplayMode }).dataDisplayMode ?? 'COUNTS_AND_PERCENTAGES'
    );
    const [defaultView, setDefaultViewState] = useState<DefaultDashboardView>(
        (stored as { defaultView?: DefaultDashboardView }).defaultView ?? 'overview'
    );

    const setHighContrast = useCallback((v: boolean) => setHighContrastState(v), []);
    const setReduceMotion = useCallback((v: boolean) => setReduceMotionState(v), []);
    const setDataDisplayMode = useCallback((v: DataDisplayMode) => setDataDisplayModeState(v), []);
    const setDefaultView = useCallback((v: DefaultDashboardView) => setDefaultViewState(v), []);

    const syncFromBackend = useCallback(async () => {
        try {
            const { data } = await apiClient.get<{
                userId: string;
                preferences: {
                    defaultView?: string;
                    highContrast?: boolean;
                    reducedMotion?: boolean;
                    dataDisplayMode?: string;
                };
            }>('/api/v1/me/settings');
            const prefs = data.preferences;
            if (prefs.defaultView) setDefaultView(prefs.defaultView as DefaultDashboardView);
            if (prefs.highContrast !== undefined) setHighContrast(prefs.highContrast);
            if (prefs.reducedMotion !== undefined) setReduceMotion(prefs.reducedMotion);
            if (prefs.dataDisplayMode) setDataDisplayMode(prefs.dataDisplayMode as DataDisplayMode);
        } catch { /* fail silently */ }
    }, [setDefaultView, setHighContrast, setReduceMotion, setDataDisplayMode]);

    // Persist any change
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify({ highContrast, reduceMotion, dataDisplayMode, defaultView }));
    }, [highContrast, reduceMotion, dataDisplayMode, defaultView]);

    // Sync high-contrast class
    useEffect(() => {
        const root = document.documentElement;
        if (highContrast) root.classList.add('high-contrast');
        else root.classList.remove('high-contrast');
    }, [highContrast]);

    // Sync reduce-motion class
    useEffect(() => {
        const root = document.documentElement;
        if (reduceMotion) root.classList.add('reduce-motion');
        else root.classList.remove('reduce-motion');
    }, [reduceMotion]);

    return (
        <SettingsContext.Provider value={{
            highContrast, reduceMotion, dataDisplayMode, defaultView,
            setHighContrast, setReduceMotion, setDataDisplayMode, setDefaultView,
            syncFromBackend,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = (): ISettingsContext => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettingsContext must be used within SettingsContextProvider');
    return ctx;
};
