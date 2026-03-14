import {
    createContext, useContext, useState,
    useCallback, ReactNode, useEffect
} from 'react';
import { useAuth } from './AuthContext';

interface IAlertsContext {
    unreadCount: number;
    setUnreadCount: (count: number) => void;
    decrementUnread: () => void;
    clearUnread: () => void;
    markAllRead: () => void;
    markAllUnread: (totalCount: number) => void;
}

const AlertsContext = createContext<IAlertsContext | undefined>(undefined);

export const AlertsProvider = ({ children }: { children: ReactNode }) => {
    const [unreadCount, setUnreadCountState] = useState<number>(0);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            setUnreadCountState(0);
        }
    }, [isAuthenticated]);

    const setUnreadCount = useCallback((count: number) => {
        setUnreadCountState(Math.max(0, count));
    }, []);

    const decrementUnread = useCallback(() => {
        setUnreadCountState((prev) => Math.max(0, prev - 1));
    }, []);

    const clearUnread = useCallback(() => {
        setUnreadCountState(0);
    }, []);

    const markAllRead = useCallback(() => {
        setUnreadCountState(0);
    }, []);

    const markAllUnread = useCallback((totalCount: number) => {
        setUnreadCountState(Math.max(0, totalCount));
    }, []);

    return (
        <AlertsContext.Provider
            value={{ unreadCount, setUnreadCount, decrementUnread, clearUnread, markAllRead, markAllUnread }}
        >
            {children}
        </AlertsContext.Provider>
    );
};

export const useAlertsContext = (): IAlertsContext => {
    const ctx = useContext(AlertsContext);
    if (!ctx) throw new Error('useAlertsContext must be used within AlertsProvider');
    return ctx;
};
