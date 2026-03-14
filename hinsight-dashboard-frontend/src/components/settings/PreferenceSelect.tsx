interface PreferenceSelectProps {
    label: string;
    description: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

const PreferenceSelect = ({ label, description, value, options, onChange }: PreferenceSelectProps) => (
    <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
        </div>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg
                 px-3 py-1.5 bg-white dark:bg-card-dark
                 text-gray-700 dark:text-gray-200
                 focus:outline-none focus:ring-2 focus:ring-brand/50 min-w-[180px]"
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

export default PreferenceSelect;
