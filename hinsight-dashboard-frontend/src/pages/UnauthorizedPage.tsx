import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center
                    bg-surface-light dark:bg-surface-dark px-4">
            <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                    <ShieldOff size={28} className="text-rose-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Access Denied (403)
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Your current role does not have permission to view this page.
                    This access control is enforced per HIPAA §164.308(a)(1) — role-based access management.
                </p>
                <button
                    onClick={() => navigate('/overview')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm
                     bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
                >
                    <ArrowLeft size={14} />
                    Return to Overview
                </button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
