import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { useAlertsContext } from '../../context/AlertsContext';
import UnreadAlertsBadge from '../common/UnreadAlertsBadge';

interface NavItem {
    path: string;
    label: string;
    icon: string; // Material Icon name
    permission: string | null;
    showAlertBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { path: '/overview', label: 'Overview', icon: 'dashboard', permission: 'view:overview' },
    { path: '/lifestyle', label: 'Lifestyle', icon: 'interests', permission: 'view:lifestyle' },
    { path: '/nutrition-obesity', label: 'Nutrition & Obesity', icon: 'restaurant', permission: 'view:nutrition_obesity' },
    { path: '/feelings', label: 'Feelings', icon: 'mood', permission: 'view:feelings' },
    { path: '/platform', label: 'Platform', icon: 'admin_panel_settings', permission: 'view:platform' },
    { path: '/alerts', label: 'Alerts', icon: 'notifications', permission: 'view:alerts', showAlertBadge: true },
    { path: '/settings', label: 'Settings', icon: 'settings', permission: 'view:settings' },
    { path: '/help', label: 'Help', icon: 'help_outline', permission: null },
];

const Sidebar = () => {
    const { hasPermission, logout } = useAuth();
    const { unreadCount } = useAlertsContext();

    const visibleItems = NAV_ITEMS.filter(
        (item) => item.permission === null || hasPermission(item.permission)
    );

    return (
        <aside className="w-16 flex flex-col items-center py-6 gap-2
                      bg-brand dark:bg-brand-dark
                      border-r border-brand-dark dark:border-brand
                      shrink-0">
            <nav className="flex flex-col gap-1 flex-1 w-full px-2" aria-label="Main navigation">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        title={item.label}
                        className={({ isActive }) =>
                            clsx(
                                'relative flex items-center justify-center w-full h-10 rounded-lg',
                                'transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                                isActive
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/60 hover:text-white hover:bg-white/10'
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <span
                                    className={clsx(
                                        'material-icons text-[20px] transition-opacity duration-150',
                                        isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'
                                    )}
                                    aria-hidden="true"
                                >
                                    {item.icon}
                                </span>
                                {item.showAlertBadge && <UnreadAlertsBadge count={unreadCount} />}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout — bottom */}
            <button
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="flex items-center justify-center w-10 h-10 rounded-lg
                   text-white/60 hover:text-white hover:bg-white/10
                   transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
                <span className="material-icons text-[20px]" aria-hidden="true">logout</span>
            </button>
        </aside>
    );
};

export default Sidebar;
