import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchBar = ({ value, onChange, placeholder = 'Search...' }: SearchBarProps) => (
    <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400" size={16} />
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600
                 bg-white dark:bg-card-dark text-gray-800 dark:text-gray-200
                 focus:outline-none focus:ring-2 focus:ring-brand/40 w-56 transition"
        />
    </div>
);

export default SearchBar;
