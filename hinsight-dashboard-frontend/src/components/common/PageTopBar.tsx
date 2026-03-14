import { Search } from 'lucide-react';

interface PageTopBarProps {
    title: string;
    searchQuery: string;
    onSearchChange: (v: string) => void;
    employeeCount?: number;
}

const PageTopBar = ({ title, searchQuery, onSearchChange, employeeCount = 70 }: PageTopBarProps) => {
    return (
        <div className="flex items-center gap-4 px-6 pt-4 pb-2">
            {/* Page title */}
            <h1 className="text-2xl font-bold text-brand dark:text-white leading-tight whitespace-pre-line min-w-[140px]">
                {title}
            </h1>

            {/* Search bar — centered */}
            <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-md">
                    <input
                        id="page-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search"
                        aria-label="Search factors and conditions"
                        className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 dark:border-gray-600
                                   bg-white dark:bg-card-dark text-sm text-gray-700 dark:text-gray-200
                                   placeholder-gray-400 dark:placeholder-gray-500
                                   focus:outline-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-brand-light/30
                                   transition-shadow"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                        <Search size={16} />
                    </span>
                </div>
            </div>

            {/* Employee count badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-600 shadow-sm shrink-0">
                <span className="text-xs text-gray-400 dark:text-gray-400 whitespace-nowrap">Total no of employees</span>
                <span className="text-lg font-bold text-brand dark:text-white">{employeeCount}</span>
            </div>
        </div>
    );
};

export default PageTopBar;
