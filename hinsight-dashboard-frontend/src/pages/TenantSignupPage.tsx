import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { authService } from '../services/authService';
import { setDataRegion } from '../services/apiClient';

const TenantSignupPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<{
        tenant_name: string;
        tenant_slug: string;
        data_region: 'CA' | 'US';
        admin_email: string;
        admin_password: string;
    }>({
        tenant_name: '',
        tenant_slug: '',
        data_region: 'CA',
        admin_email: '',
        admin_password: '',
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
            await authService.tenantSignup(form);
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
                        <Building2 size={24} className="text-brand" />
                    </div>
                    <h1 className="text-xl font-bold text-brand dark:text-brand-light">
                        Register Your Organization
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        Create a new HINSIGHT tenant
                    </p>
                </div>

                <Input label="Organization Name" value={form.tenant_name}
                       onChange={(v) => update('tenant_name', v)} placeholder="Acme Corp" />

                <Input label="Tenant Slug" value={form.tenant_slug}
                       onChange={(v) => update('tenant_slug', v.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                       placeholder="acme-corp" />

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

                <Input label="Admin Email" type="email" value={form.admin_email}
                       onChange={(v) => update('admin_email', v)} placeholder="admin@acme.com" />

                <Input label="Admin Password" type="password" value={form.admin_password}
                       onChange={(v) => update('admin_password', v)} placeholder="••••••••" />

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
                    {isSubmitting ? 'Creating…' : 'Create Organization'}
                </button>

                <p className="text-center text-xs text-gray-400">
                    Already registered?{' '}
                    <Link to="/login" className="text-brand hover:underline">Log in</Link>
                </p>
            </form>
        </div>
    );
};

/* ───── tiny reusable input ───── */
const Input = ({
    label, value, onChange, placeholder, type = 'text',
}: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; type?: string;
}) => (
    <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required
            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                       bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
    </div>
);

export default TenantSignupPage;
