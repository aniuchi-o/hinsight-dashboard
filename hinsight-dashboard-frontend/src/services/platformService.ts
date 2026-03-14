import { apiClient } from './apiClient';

export interface ITenantAdmin {
    id: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export interface ITenantRecord {
    id: string;
    slug: string;
    name: string;
    data_region: string;
    created_at: string;
    admins: ITenantAdmin[];
}

export interface IPlatformTenantsResponse {
    tenants: ITenantRecord[];
    total: number;
}

export async function fetchAllTenants(): Promise<IPlatformTenantsResponse> {
    const { data } = await apiClient.get<IPlatformTenantsResponse>('/api/v1/platform/tenants');
    return data;
}
