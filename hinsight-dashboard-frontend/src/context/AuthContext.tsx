import {
    createContext, useContext, useReducer, ReactNode, useCallback, useEffect
} from 'react';
import { IAuthState, IAuthUser, ROLE_PERMISSIONS, IJWTClaims } from '../types/auth.types';
import { decodeJWT, isTokenExpired } from '../utils/jwtUtils';
import { setAccessToken, setDataRegion } from '../services/apiClient';
import { setAlertsUserId } from '../services/alertsService';
import { useSettingsContext } from './SettingsContext';

type AuthAction =
    | { type: 'LOGIN_SUCCESS'; payload: { user: IAuthUser; accessToken: string } }
    | { type: 'LOGOUT' };

const initialState: IAuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
};

function authReducer(state: IAuthState, action: AuthAction): IAuthState {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                accessToken: action.payload.accessToken,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'LOGOUT':
            setAccessToken(null);
            setAlertsUserId('');
            return { ...initialState };
        default:
            return state;
    }
}

interface IAuthContext extends IAuthState {
    login: (accessToken: string, tenantSlug: string) => void;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const { syncFromBackend } = useSettingsContext();

    const logout = useCallback(() => {
        dispatch({ type: 'LOGOUT' });
    }, []);

    /**
     * Called after a successful POST /auth/login response.
     * Decodes the JWT to hydrate IAuthUser from claims.
     */
    const login = useCallback((accessToken: string, tenantSlug: string) => {
        const claims: IJWTClaims | null = decodeJWT(accessToken);
        if (!claims) {
            console.error('[HINSIGHT] Failed to decode JWT — rejecting login');
            return;
        }

        setDataRegion(claims.reg);
        setAccessToken(accessToken);
        setAlertsUserId(claims.sub);

        const permissions = ROLE_PERMISSIONS[claims.role] ?? [];
        const user: IAuthUser = {
            id: claims.sub,
            role: claims.role,
            tenantId: claims.tid,
            tenantSlug,
            dataRegion: claims.reg,
            displayName: tenantSlug,
            permissions,
            lastLoginAt: new Date().toISOString(),
            sessionId: crypto.randomUUID(),
        };

        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken } });
        void syncFromBackend();
    }, [syncFromBackend]);

    const hasPermission = useCallback(
        (permission: string): boolean => {
            if (!state.user) return false;
            const perms = state.user.permissions;
            return perms.includes('*') || perms.includes(permission);
        },
        [state.user]
    );

    // Listen for 401 events from the API interceptor
    useEffect(() => {
        const handleUnauthorized = () => logout();
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, [logout]);

    // Proactive token expiry check — every 30 seconds
    useEffect(() => {
        if (!state.accessToken) return;
        const interval = setInterval(() => {
            if (isTokenExpired(state.accessToken!)) {
                logout();
            }
        }, 30_000);
        return () => clearInterval(interval);
    }, [state.accessToken, logout]);

    return (
        <AuthContext.Provider value={{ ...state, login, logout, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): IAuthContext => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
