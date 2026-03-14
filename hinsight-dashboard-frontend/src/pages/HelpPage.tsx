import { Outlet, NavLink } from 'react-router-dom';
import { BookOpen, HelpCircle, MessageCircle, ShieldCheck, Keyboard } from 'lucide-react';
import { useHelpContent } from '../hooks/useHelp';
import LoadingSpinner from '../components/common/LoadingSpinner';
import clsx from 'clsx';

const NAV_LINKS = [
    { to: 'glossary', label: 'Glossary', icon: <BookOpen size={16} /> },
    { to: 'metric-definitions', label: 'Metric Definitions', icon: <HelpCircle size={16} /> },
    { to: 'faq', label: 'FAQ', icon: <MessageCircle size={16} /> },
    { to: 'regulatory-notices', label: 'Regulatory Notices', icon: <ShieldCheck size={16} /> },
    { to: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: <Keyboard size={16} /> },
];

// HelpPage provides the layout shell + data context via React Query.
// Section content is rendered by child routes via <Outlet />.
const HelpPage = () => {
    const { isLoading } = useHelpContent();

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-full p-6 space-y-4">
            {/* Page header — title only */}
            <div className="px-6 pt-4 pb-2">
                <h1 className="text-2xl font-bold text-brand dark:text-white">
                    Help
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Glossary, metric definitions, keyboard shortcuts, and compliance notices
                </p>
            </div>

            <div className="px-6 flex gap-6" style={{ minHeight: 'calc(100vh - 180px)' }}>
                {/* Left section nav */}
                <nav className="w-48 shrink-0 space-y-1">
                    {NAV_LINKS.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => clsx(
                                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                                'transition-colors duration-150',
                                isActive
                                    ? 'bg-brand text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-brand/10 hover:text-brand dark:hover:text-brand-light'
                            )}
                        >
                            {icon}
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Child route content */}
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
