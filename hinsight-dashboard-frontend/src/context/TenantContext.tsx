import { createContext, useContext, useState, ReactNode } from 'react';

type TenantRegion = 'CA' | 'US';

interface ITenantContext {
    tenantId: string;
    tenantRegion: TenantRegion;
    setTenant: (id: string, region: TenantRegion) => void;
}

const TenantContext = createContext<ITenantContext | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
    const [tenantId, setTenantId] = useState<string>('tenant-ca-001');
    const [tenantRegion, setTenantRegion] = useState<TenantRegion>('CA');

    const setTenant = (id: string, region: TenantRegion) => {
        setTenantId(id);
        setTenantRegion(region);
    };

    return (
        <TenantContext.Provider value={{ tenantId, tenantRegion, setTenant }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = (): ITenantContext => {
    const ctx = useContext(TenantContext);
    if (!ctx) throw new Error('useTenant must be used within TenantProvider');
    return ctx;
};
