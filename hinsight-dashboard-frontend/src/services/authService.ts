import { apiClient } from './apiClient';
import { ILoginPayload, ILoginResponse } from '../types/auth.types';

export const authService = {
    /**
     * POST /auth/login
     * Body: { email, password, tenant_slug, data_region, otp? }
     * Response: { access_token, token_type }
     */
    login: async (payload: ILoginPayload): Promise<ILoginResponse> => {
        const { data } = await apiClient.post<ILoginResponse>('/auth/login', payload);
        return data;
    },

    /**
     * POST /auth/mfa/setup
     * Requires authenticated session.
     * Response: { otpauth_uri }
     */
    mfaSetup: async (): Promise<{ otpauth_uri: string }> => {
        const { data } = await apiClient.post<{ otpauth_uri: string }>('/auth/mfa/setup', {});
        return data;
    },

    /**
     * POST /auth/mfa/verify
     * Body: { otp } (6-8 digit string)
     * Response varies — may return { verified: true } or new access_token
     */
    mfaVerify: async (otp: string): Promise<{ access_token?: string; [key: string]: unknown }> => {
        const { data } = await apiClient.post('/auth/mfa/verify', { otp });
        return data;
    },

    platformSignup: async (payload: {
        email: string;
        password: string;
        invite_key: string;
    }): Promise<{ user_id: string; role: string; tenant_id: string }> => {
        const { data } = await apiClient.post<{ user_id: string; role: string; tenant_id: string }>(
            '/auth/platform-signup',
            payload
        );
        return data;
    },

    /**
     * POST /auth/tenant-signup
     * Body: { tenant_name, tenant_slug, data_region, admin_email, admin_password }
     * Response: { tenant_id, admin_user_id, tenant_slug, data_region }
     */
    tenantSignup: async (payload: {
        tenant_name: string;
        tenant_slug: string;
        data_region: 'CA' | 'US';
        admin_email: string;
        admin_password: string;
    }): Promise<{ tenant_id: string; admin_user_id: string; tenant_slug: string; data_region: string }> => {
        // Include compatibility aliases for backend variants that still read email/password.
        const requestPayload = {
            ...payload,
            email: payload.admin_email,
            password: payload.admin_password,
        };
        const { data } = await apiClient.post('/auth/tenant-signup', requestPayload);
        return data;
    },

    /**
     * POST /auth/user-signup
     * Body: { tenant_slug, data_region, email, password }
     * Response: { user_id, ... }
     */
    userSignup: async (payload: {
        tenant_slug: string;
        data_region: 'CA' | 'US';
        email: string;
        password: string;
    }): Promise<{ user_id: string; tenant_id: string; role: string }> => {
        const { data } = await apiClient.post<{ user_id: string; tenant_id: string; role: string }>('/auth/user-signup', payload);
        return data;
    },
};
