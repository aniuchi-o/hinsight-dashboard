import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { setDataRegion } from '../services/apiClient';

const MFAVerifyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Login credentials passed via location state for MFA re-login
    const pending = location.state as {
        email: string;
        password: string;
        tenant_slug: string;
        data_region: 'CA' | 'US';
    } | null;

    const handleVerify = async () => {
        if (!pending) {
            setError('Session expired. Please log in again.');
            return;
        }
        setError(null);
        setIsVerifying(true);
        try {
            setDataRegion(pending.data_region);
            const { access_token } = await authService.login({
                ...pending,
                otp: code,
            });
            login(access_token, pending.tenant_slug);
            navigate('/overview', { replace: true });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Verification failed.');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark px-4">
            <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-8 w-full max-w-sm space-y-5">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-3">
                        <KeyRound size={24} className="text-brand" />
                    </div>
                    <h1 className="text-xl font-bold text-center text-brand dark:text-brand-light">
                        Two-Factor Verification
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Enter the code from your authenticator app to continue.
                    </p>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        6-digit code
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2
                                   text-sm text-center font-mono tracking-widest
                                   bg-white dark:bg-card-dark text-gray-900 dark:text-gray-100
                                   focus:outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="000000"
                        autoFocus
                    />
                </div>

                {error && (
                    <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleVerify}
                    disabled={isVerifying || code.length < 6}
                    className="w-full py-2.5 bg-brand text-white rounded-lg font-medium text-sm
                               hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                    {isVerifying ? 'Verifying…' : 'Verify'}
                </button>

                <button
                    onClick={() => navigate('/login', { replace: true })}
                    className="w-full text-xs text-gray-400 hover:text-brand transition-colors"
                >
                    ← Back to login
                </button>
            </div>
        </div>
    );
};

export default MFAVerifyPage;
