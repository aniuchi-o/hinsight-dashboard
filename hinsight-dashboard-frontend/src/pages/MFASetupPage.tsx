import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const MFASetupPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLoadingSetup, setIsLoadingSetup] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;
        authService.mfaSetup()
            .then((res) => setOtpauthUri(res.otpauth_uri))
            .catch(() => setError('Failed to initialize MFA setup.'))
            .finally(() => setIsLoadingSetup(false));
    }, [isAuthenticated]);

    const handleVerify = async () => {
        setError(null);
        setIsVerifying(true);
        try {
            await authService.mfaVerify(code);
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
                        <Shield size={24} className="text-brand" />
                    </div>
                    <h1 className="text-xl font-bold text-center text-brand dark:text-brand-light">
                        Set Up Two-Factor Authentication
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Scan the QR code with your authenticator app, then enter the 6-digit code to confirm.
                    </p>
                </div>

                {isLoadingSetup && (
                    <p className="text-center text-sm text-gray-400">Loading…</p>
                )}

                {otpauthUri && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                        <p className="text-[11px] text-gray-400 mb-2">OTPAuth URI (paste into your authenticator app)</p>
                        <p className="font-mono text-xs text-brand dark:text-brand-light break-all select-all">
                            {otpauthUri}
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        6-digit verification code
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
                    {isVerifying ? 'Verifying…' : 'Verify & Enable MFA'}
                </button>
            </div>
        </div>
    );
};

export default MFASetupPage;
