import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserSettings, useUpdatePreferences, useAcceptCompliance } from '../hooks/useSettings';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSettingsContext } from '../context/SettingsContext';
import { apiClient } from '../services/apiClient';
import SettingsSection from '../components/settings/SettingsSection';
import PreferenceToggle from '../components/settings/PreferenceToggle';
import PreferenceSelect from '../components/settings/PreferenceSelect';
import RoleBadge from '../components/settings/RoleBadge';
import SessionInfoPanel from '../components/settings/SessionInfoPanel';
import ComplianceNoticePanel from '../components/settings/ComplianceNoticePanel';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { IUserPreferences, DefaultDashboardView, DataDisplayMode } from '../types/settings.types';

// Simple toast state
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

const SettingsPage = () => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { data: settings, isLoading } = useUserSettings();
    const updatePreferencesMutation = useUpdatePreferences();
    const acceptComplianceMutation = useAcceptCompliance();
    const {
        highContrast, setHighContrast,
        reduceMotion, setReduceMotion,
        dataDisplayMode, setDataDisplayMode,
        defaultView, setDefaultView,
    } = useSettingsContext();
    const isTenantAdmin = user?.role === 'admin';
    const { data: tenantUsersData } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => apiClient.get('/api/v1/admin/users').then((r) => r.data as { users: Array<{ id: string; email: string; role: string; is_active: boolean }>; total: number }),
        enabled: isTenantAdmin,
        staleTime: 60_000,
    });

    const [toast, setToast] = useState<string | null>(null);

    // Live session duration
    const [sessionDuration, setSessionDuration] = useState('');
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const startedAt = settings?.session?.sessionStartedAt;
        if (!startedAt) return;
        const update = () => {
            const diff = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            setSessionDuration(h > 0 ? `${h}h ${m}m` : `${m}m`);
        };
        update();
        timerRef.current = setInterval(update, 60_000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [settings?.session?.sessionStartedAt]);

    const showToast = (msg: string) => {
        setToast(msg);
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => setToast(null), 3000);
    };

    const handlePreferenceChange = <K extends keyof IUserPreferences>(key: K, value: IUserPreferences[K]) => {
        updatePreferencesMutation.mutate({ [key]: value });

        // Side-effects via SettingsContext
        if (key === 'highContrast') { setHighContrast(value as boolean); showToast('High contrast ' + (value ? 'enabled' : 'disabled')); }
        if (key === 'reducedMotion') { setReduceMotion(value as boolean); showToast('Reduce motion ' + (value ? 'enabled' : 'disabled')); }
        if (key === 'dataDisplayMode') { setDataDisplayMode(value as DataDisplayMode); showToast('Data display mode updated'); }
        if (key === 'defaultView') { setDefaultView(value as DefaultDashboardView); showToast('Default landing view saved'); }
        if (key === 'alertDigestFrequency') showToast('Preference saved');
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-full p-6 space-y-4">
            {/* Page header — title only */}
            <div className="px-6 pt-4 pb-2">
                <h1 className="text-2xl font-bold text-brand dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Your preferences, session information, and compliance records
                </p>
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 bg-brand text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                    {toast}
                </div>
            )}

            <div className="px-6 grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Role & Access */}
                <SettingsSection
                    title="Role & Access"
                    description="Your access level is assigned by your organization administrator."
                >
                    <div className="flex flex-wrap items-center gap-6">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Display name</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.displayName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned role</p>
                            {user?.role && <RoleBadge role={user.role} />}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Region</p>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {settings?.session.tenantRegion === 'CA' ? '🇨🇦 Canada (PHIPA)' : '🇺🇸 United States (HIPAA)'}
                            </p>
                        </div>
                    </div>
                </SettingsSection>

                {/* Alert Notifications */}
                <SettingsSection
                    title="Alert Notifications"
                    description="Email digests summarize aggregated alert activity. No individual health information is included."
                >
                    <PreferenceSelect
                        label="Alert Digest Frequency"
                        description="How often to receive an email summary of active alerts"
                        value={settings?.preferences.alertDigestFrequency ?? 'WEEKLY'}
                        options={[
                            { value: 'NONE', label: 'Disabled' },
                            { value: 'DAILY', label: 'Daily Summary' },
                            { value: 'WEEKLY', label: 'Weekly Summary' },
                        ]}
                        onChange={(v) => handlePreferenceChange('alertDigestFrequency', v as IUserPreferences['alertDigestFrequency'])}
                    />
                </SettingsSection>

                {/* Display Preferences */}
                <SettingsSection
                    title="Display Preferences"
                    description="Customize how data is presented across all dashboard views."
                >
                    <div className="space-y-4">
                        <PreferenceToggle
                            label="Dark Mode"
                            description="Reduce eye strain in low-light environments"
                            checked={theme === 'dark'}
                            onChange={toggleTheme}
                        />
                        <PreferenceToggle
                            label="High Contrast Mode"
                            description="Increase text and chart contrast for accessibility"
                            checked={highContrast}
                            onChange={(v) => handlePreferenceChange('highContrast', v)}
                        />
                        <PreferenceToggle
                            label="Reduce Motion"
                            description="Disable chart animations (recommended for vestibular sensitivity)"
                            checked={reduceMotion}
                            onChange={(v) => handlePreferenceChange('reducedMotion', v)}
                        />
                        <PreferenceSelect
                            label="Default Landing View"
                            description="Which dashboard tab opens on login"
                            value={defaultView}
                            options={[
                                { value: 'overview', label: 'Overview' },
                                { value: 'lifestyle', label: 'Lifestyle' },
                                { value: 'nutrition_obesity', label: 'Nutrition and Obesity' },
                                { value: 'feelings', label: 'Feelings' },
                            ]}
                            onChange={(v) => handlePreferenceChange('defaultView', v as IUserPreferences['defaultView'])}
                        />
                        <PreferenceSelect
                            label="Data Display Mode"
                            description="How metric values appear in charts and KPI tiles"
                            value={dataDisplayMode}
                            options={[
                                { value: 'COUNTS_AND_PERCENTAGES', label: 'Counts and Percentages' },
                                { value: 'PERCENTAGES_ONLY', label: 'Percentages Only' },
                                { value: 'COUNTS_ONLY', label: 'Counts Only' },
                            ]}
                            onChange={(v) => handlePreferenceChange('dataDisplayMode', v as IUserPreferences['dataDisplayMode'])}
                        />
                    </div>
                </SettingsSection>

                {/* Session Information */}
                {settings?.session && (
                    <SettingsSection
                        title="Session Information"
                        description="Current session details. Sessions expire automatically after the configured timeout."
                    >
                        <SessionInfoPanel session={settings.session} />
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                            Session active for: <strong className="text-brand dark:text-brand-light">{sessionDuration}</strong>
                        </p>
                    </SettingsSection>
                )}

                {/* Compliance — full width */}
                {settings?.compliance && (
                    <div className="col-span-1 lg:col-span-2">
                        <SettingsSection
                            title="Compliance & Regulatory Notices"
                            description="Your acknowledgement records for HIPAA and PHIPA data handling notices. Required by law."
                        >
                            <ComplianceNoticePanel
                                compliance={settings.compliance}
                                onAccept={(noticeType) =>
                                    acceptComplianceMutation.mutate({
                                        noticeType,
                                        policyVersion: settings.compliance.dataRetentionPolicyVersion,
                                        acceptedAt: new Date().toISOString(),
                                    })
                                }
                                isAccepting={acceptComplianceMutation.isPending}
                            />
                        </SettingsSection>
                    </div>
                )}

                {isTenantAdmin && tenantUsersData && (
                    <SettingsSection title="Tenant Users" description="All user accounts registered in your organisation.">
                        <div className="space-y-1">
                            {tenantUsersData.users.map((u) => (
                                <div
                                    key={u.id}
                                    className="flex items-center justify-between text-xs
                                               bg-gray-50 dark:bg-gray-800/50 rounded px-3 py-2"
                                >
                                    <span className="text-gray-700 dark:text-gray-300">{u.email}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 capitalize">{u.role}</span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                                            ${u.is_active
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-gray-100 text-gray-500'}`}>
                                            {u.is_active ? 'active' : 'inactive'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            Total: {tenantUsersData.total} user{tenantUsersData.total !== 1 ? 's' : ''}
                        </p>
                    </SettingsSection>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
