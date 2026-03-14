import { useQuery } from '@tanstack/react-query';
import { Building2, Users, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAllTenants } from '../services/platformService';
import type { ITenantRecord } from '../services/platformService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PlatformPage = () => {
    const { user } = useAuth();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['platform-tenants'],
        queryFn: fetchAllTenants,
        staleTime: 2 * 60 * 1000,
    });

    return (
        <div className="min-h-full p-6 space-y-6">
            {/* Header */}
            <div className="px-6 pt-4 pb-2">
                <h1 className="text-2xl font-bold text-brand dark:text-white flex items-center gap-2">
                    <ShieldCheck size={22} />
                    Platform Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Cross-tenant administration view — all registered organisations and their admins
                </p>
            </div>

            {/* Own account card */}
            <div className="px-6">
                <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4 max-w-sm">
                    <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Your Account
                    </h2>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Role</span>
                            <span className="font-medium text-brand dark:text-brand-light capitalize">
                                {user?.role?.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Region</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                                {user?.dataRegion}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Session</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 text-xs">
                                {user?.sessionId?.slice(0, 8)}…
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tenant list */}
            <div className="px-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Building2 size={16} />
                        Registered Tenants
                        {data && (
                            <span className="ml-1 text-xs bg-brand/10 text-brand dark:text-brand-light px-2 py-0.5 rounded-full">
                                {data.total}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={() => refetch()}
                        className="text-xs text-brand dark:text-brand-light hover:underline"
                    >
                        Refresh
                    </button>
                </div>

                {isLoading && <LoadingSpinner />}

                {isError && (
                    <p className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-4 py-3">
                        Failed to load tenant data. Ensure the backend is running.
                    </p>
                )}

                {data && data.tenants.length === 0 && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        No tenants registered yet. Use "Register Your Organization" to create the first tenant.
                    </p>
                )}

                {data && data.tenants.length > 0 && (
                    <div className="space-y-3">
                        {data.tenants.map((tenant: ITenantRecord) => (
                            <div
                                key={tenant.id}
                                className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                                            {tenant.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                                            slug: {tenant.slug}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Globe size={12} />
                                        {tenant.data_region}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-2">
                                        <Users size={12} />
                                        Administrators ({tenant.admins.length})
                                    </p>
                                    {tenant.admins.length === 0 ? (
                                        <p className="text-xs text-gray-400 italic">No admin accounts found</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {tenant.admins.map((admin) => (
                                                <div
                                                    key={admin.id}
                                                    className="flex items-center justify-between text-xs
                                                               bg-gray-50 dark:bg-gray-800/50 rounded px-3 py-1.5"
                                                >
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {admin.email}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                                                        ${admin.is_active
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-gray-100 text-gray-500'}`}>
                                                        {admin.is_active ? 'active' : 'inactive'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2">
                                    Created: {new Date(tenant.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlatformPage;
