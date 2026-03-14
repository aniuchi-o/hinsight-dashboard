interface DropdownFilterProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

const DropdownFilter = ({ label, value, options, onChange }: DropdownFilterProps) => (
    <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5
                 bg-white dark:bg-card-dark text-gray-700 dark:text-gray-200
                 focus:outline-none focus:ring-2 focus:ring-brand/50"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export default DropdownFilter;
