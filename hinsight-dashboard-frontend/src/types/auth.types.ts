// Lowercase roles matching backend JWT `role` claim
export type UserRole = 'platform_admin' | 'admin' | 'executive' | 'wellness_manager' | 'program_manager' | 'viewer';

export interface ILoginPayload {
    email: string;
    password: string;
    tenant_slug: string;
    data_region: 'CA' | 'US';
    otp?: string;
}

export interface ILoginResponse {
    access_token: string;
    token_type: 'bearer';
}

/**
 * JWT claims structure from backend:
 * sub  → user ID        tid  → tenant ID
 * reg  → data region    role → user role
 * iat  → issued at      exp  → expiration
 */
export interface IJWTClaims {
    sub: string;
    tid: string;
    reg: 'CA' | 'US';
    role: UserRole;
    iat: number;
    exp: number;
}

/**
 * RBAC Permissions Map — includes Alerts, Settings, Help.
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    platform_admin: [
        'view:platform',
        'view:settings',
        'view:help',
    ],
    viewer: [
        'view:overview',
        'view:lifestyle',
        'view:nutrition_obesity',
        'view:feelings',
        'view:alerts',
        'view:help',
        'action:alerts:view',
        'action:alerts:acknowledge',
    ],
    executive: [
        'view:overview',
        'view:lifestyle',
        'view:nutrition_obesity',
        'view:feelings',
        'view:alerts',
        'view:settings',
        'view:help',
        'action:alerts:view',
        'action:settings:mutate',
    ],
    wellness_manager: [
        'view:overview',
        'view:lifestyle',
        'view:nutrition_obesity',
        'view:feelings',
        'view:reports',
        'view:alerts',
        'view:settings',
        'view:help',
        'action:alerts:view',
        'action:alerts:acknowledge',
        'action:settings:mutate',
    ],
    program_manager: [
        'view:overview',
        'view:lifestyle',
        'view:alerts',
        'view:settings',
        'view:help',
        'action:alerts:view',
        'action:alerts:acknowledge',
        'action:settings:mutate',
    ],
    admin: [
        '*',
        'action:settings:system',
        'action:alerts:dismiss:all',
        'view:user:management',
    ],
};

export interface IAuthUser {
    id: string;
    role: UserRole;
    tenantId: string;
    tenantSlug: string;
    dataRegion: 'CA' | 'US';
    displayName: string;
    permissions: string[];
    lastLoginAt: string;
    sessionId: string;
}

export interface IAuthState {
    user: IAuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
}
