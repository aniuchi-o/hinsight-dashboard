import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

const PlatformSignupPage = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '', invite_key: '' });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const update = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await authService.platformSignup(form);
            navigate('/login', {
                state: {
                    signupSuccess: true,
                    prefillSlug: 'platform',
                    prefillRegion: 'CA',
                },
            });
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
                        <ShieldCheck size={24} className="text-brand" />
                    </div>
                    <h1 className="text-xl font-bold text-brand dark:text-brand-light">
                        Platform Admin Setup
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                        Create a cross-tenant platform administrator account
                    </p>
                </div>

                {[
                    { label: 'Email', field: 'email', type: 'email', placeholder: 'platform@yourdomain.com' },
                    { label: 'Password', field: 'password', type: 'password', placeholder: '••••••••' },
                    { label: 'Invite Key', field: 'invite_key', type: 'password', placeholder: 'Platform invite key' },
                ].map(({ label, field, type, placeholder }) => (
                    <div key={field}>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            {label}
                        </label>
                        <input
                            type={type}
                            value={form[field as keyof typeof form]}
                            onChange={(e) => update(field, e.target.value)}
                            placeholder={placeholder}
                            required
                            className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                                       bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100
                                       focus:outline-none focus:ring-2 focus:ring-brand/50"
                        />
                    </div>
                ))}

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
                    {isSubmitting ? 'Creating…' : 'Create Platform Admin'}
                </button>

                <p className="text-center text-xs text-gray-400">
                    Already registered?{' '}
                    <Link to="/login" className="text-brand hover:underline">Log in</Link>
                </p>
            </form>
        </div>
    );
};

export default PlatformSignupPage;
