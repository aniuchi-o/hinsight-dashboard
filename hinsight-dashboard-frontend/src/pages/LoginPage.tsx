import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { setDataRegion } from '../services/apiClient';
import { decodeJWT } from '../utils/jwtUtils';

const DEMO_CREDENTIALS = {
    email: 'admin@demo.com',
    password: 'DemoPass123!',
    tenant_slug: 'demo',
    data_region: 'CA' as const,
};

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        password: '',
        tenant_slug: '',
        data_region: 'CA' as 'CA' | 'US',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            // Set region before the login call so the interceptor sends the right header
            setDataRegion(form.data_region);
            const response = await authService.login(form);
            login(response.access_token, form.tenant_slug);
            const claims = decodeJWT(response.access_token);
            // Navigate to "/" and let the root route redirect logic handle the default landing view
            // (after SettingsContext syncs from backend)
            if (claims?.role === 'platform_admin') {
                navigate('/platform', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
                const detailLower = detail?.toLowerCase() ?? '';

                if (status === 401 && detailLower.includes('mfa required')) {
                    navigate('/mfa/verify', {
                        replace: true,
                        state: {
                            email: form.email,
                            password: form.password,
                            tenant_slug: form.tenant_slug,
                            data_region: form.data_region,
                        },
                    });
                    return;
                }

                setError(detail ?? err.message ?? 'Login failed. Check your credentials.');
                return;
            }

            const message = err instanceof Error ? err.message : 'Login failed. Check your credentials.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoCredentials = () => setForm(DEMO_CREDENTIALS);

    return (
        <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-surface-light to-brand-50
                    dark:from-surface-dark dark:to-brand-dark px-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-8">
                    {/* Logo + brand */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mb-3 shadow-lg">
                            <span className="text-white font-bold text-2xl">N</span>
                        </div>
                        <h1 className="text-xl font-bold text-brand dark:text-brand-light">HINSIGHT</h1>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Executive Health Outcomes Dashboard</p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <Shield size={10} />
                            HIPAA · PHIPA compliant
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                className="w-full px-3 py-2.5 text-sm rounded-lg
                           border border-gray-200 dark:border-gray-600
                           bg-gray-50 dark:bg-surface-dark
                           text-gray-800 dark:text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-brand/50"
                                placeholder="you@company.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                    className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg
                             border border-gray-200 dark:border-gray-600
                             bg-gray-50 dark:bg-surface-dark
                             text-gray-800 dark:text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-brand/50"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Tenant Slug */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Organisation ID (tenant slug)
                            </label>
                            <input
                                type="text"
                                value={form.tenant_slug}
                                onChange={(e) => setForm((p) => ({ ...p, tenant_slug: e.target.value }))}
                                className="w-full px-3 py-2.5 text-sm rounded-lg
                           border border-gray-200 dark:border-gray-600
                           bg-gray-50 dark:bg-surface-dark
                           text-gray-800 dark:text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-brand/50"
                                placeholder="your-org-slug"
                                autoComplete="organization"
                                required
                            />
                        </div>

                        {/* Data Region */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Data region
                            </label>
                            <select
                                value={form.data_region}
                                onChange={(e) => setForm((p) => ({ ...p, data_region: e.target.value as 'CA' | 'US' }))}
                                className="w-full px-3 py-2.5 text-sm rounded-lg
                           border border-gray-200 dark:border-gray-600
                           bg-gray-50 dark:bg-surface-dark
                           text-gray-800 dark:text-gray-200
                           focus:outline-none focus:ring-2 focus:ring-brand/50"
                            >
                                <option value="CA">Canada (PHIPA compliant)</option>
                                <option value="US">United States (HIPAA compliant)</option>
                            </select>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !form.email || !form.password || !form.tenant_slug}
                            className="w-full py-2.5 px-4 bg-brand hover:bg-brand-dark
                         text-white font-semibold text-sm rounded-lg
                         transition-colors duration-200
                         disabled:opacity-60 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-brand/50"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Authenticating…
                                </span>
                            ) : (
                                'Sign in to HINSIGHT'
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mb-2">
                            Development testing
                        </p>
                        <button
                            onClick={fillDemoCredentials}
                            className="w-full py-2 border border-brand/30 text-brand dark:text-brand-light
                                       rounded-lg text-xs hover:bg-brand/5 transition-colors"
                        >
                            Use demo credentials
                        </button>
                    </div>

                    {/* Signup links */}
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
                        New organisation?{' '}
                        <Link to="/signup/tenant" className="text-brand hover:underline">Register here</Link>
                        {' · '}
                        <Link to="/signup/user" className="text-brand hover:underline">Create user account</Link>
                        {' · '}
                        <Link to="/signup/platform" className="text-brand hover:underline">Platform admin</Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-4">
                    © 2026 NYTIA Health Inc. · HIPAA/PHIPA compliant data handling
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
