import clsx from 'clsx';
import { UserRole } from '../../types/auth.types';

const ROLE_STYLES: Record<UserRole, string> = {
    platform_admin: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    viewer: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    executive: 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light',
    wellness_manager: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    program_manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

const ROLE_LABELS: Record<UserRole, string> = {
    platform_admin: 'Platform Administrator',
    viewer: 'Viewer',
    executive: 'Executive',
    wellness_manager: 'Wellness Manager',
    program_manager: 'Program Manager',
    admin: 'System Administrator',
};

const RoleBadge = ({ role }: { role: UserRole }) => (
    <span className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
        ROLE_STYLES[role]
    )}>
        {ROLE_LABELS[role]}
    </span>
);

export default RoleBadge;
