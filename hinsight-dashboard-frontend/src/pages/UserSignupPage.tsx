import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { authService } from '../services/authService';
import { setDataRegion } from '../services/apiClient';

const UserSignupPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<{
        tenant_slug: string;
        data_region: 'CA' | 'US';
        email: string;
        password: string;
    }>({
        tenant_slug: '',
        data_region: 'CA',
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            setDataRegion(form.data_region);
            await authService.userSignup(form);
            navigate('/login', { state: { signupSuccess: true } });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Signup failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-8 w-full max-w-sm space-y-4"
            >
                <div className="flex flex-col items-center mb-2">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-3">
                        <UserPlus size={24} className="text-brand" />
                    </div>
                    <h1 className="text-xl font-bold text-brand dark:text-brand-light">
                        Join Your Organization
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        Sign up as a user under an existing tenant
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tenant Slug</label>
                    <input
                        type="text"
                        value={form.tenant_slug}
                        onChange={(e) => update('tenant_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="acme-corp"
                        required
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                                   bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-brand/50"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data Region</label>
                    <select
                        value={form.data_region}
                        onChange={(e) => update('data_region', e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                                   bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-brand/50"
                    >
                        <option value="CA">Canada</option>
                        <option value="US">United States</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="you@acme.com"
                        required
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                                   bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-brand/50"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Password</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                                   bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-brand/50"
                    />
                </div>

                {error && (
                    <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-brand text-white rounded-lg font-medium text-sm
                               hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Signing up…' : 'Sign Up'}
                </button>

                <p className="text-center text-xs text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand hover:underline">Log in</Link>
                </p>
            </form>
        </div>
    );
};

export default UserSignupPage;
