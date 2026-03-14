import { Users } from 'lucide-react';

interface EmployeeCountBadgeProps {
    count: number;
}

const EmployeeCountBadge = ({ count }: EmployeeCountBadgeProps) => (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light text-sm font-medium">
        <Users size={14} />
        <span>{count.toLocaleString()} employees</span>
    </div>
);

export default EmployeeCountBadge;
