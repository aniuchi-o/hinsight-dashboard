import { Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAlertsContext } from '../../context/AlertsContext';
import UnreadAlertsBadge from '../common/UnreadAlertsBadge';

const TopBar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const { unreadCount } = useAlertsContext();
    const navigate = useNavigate();

    return (
        <header className="h-16 flex items-center justify-between px-6 py-4 gap-4
                       bg-card-light dark:bg-card-dark
                       border-b border-gray-100 dark:border-gray-700 shrink-0">
            {/* Left: Sponsor logo / wordmark — links to Overview */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/overview')}
                    aria-label="Go to Overview"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
                        <span className="text-white font-bold text-xs">N</span>
                    </div>
                    <span className="font-semibold text-brand dark:text-brand-light text-sm tracking-tight">
                        HINSIGHT
                    </span>
                </button>
            </div>

            {/* Right: dark mode toggle, bell, user avatar */}
            <div className="flex items-center gap-5">
                <button
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg
                     text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand-light
                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Bell / alerts with badge */}
                <button
                    onClick={() => navigate('/alerts')}
                    aria-label="Go to Alerts"
                    className="relative w-8 h-8 flex items-center justify-center rounded-lg
                               text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-brand-light
                               hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="material-icons text-[18px]">notifications</span>
                    <UnreadAlertsBadge count={unreadCount} />
                </button>

                {/* User / profile → settings */}
                <button
                    onClick={() => navigate('/settings')}
                    aria-label="Go to Settings"
                    className="w-8 h-8 rounded-full bg-brand/20 dark:bg-brand/40
                               flex items-center justify-center
                               hover:ring-2 hover:ring-brand transition-all"
                >
                    <span className="text-brand dark:text-brand-light font-semibold text-xs">
                        {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                </button>
            </div>
        </header>
    );
};

export default TopBar;
