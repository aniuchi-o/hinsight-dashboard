import clsx from 'clsx';

interface PreferenceToggleProps {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}

const PreferenceToggle = ({ label, description, checked, onChange, disabled = false }: PreferenceToggleProps) => (
    <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>
        </div>
        <button
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={clsx(
                'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent',
                'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand/50',
                checked ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            <span
                className={clsx(
                    'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow',
                    'transform transition-transform duration-200',
                    checked ? 'translate-x-4' : 'translate-x-0'
                )}
            />
        </button>
    </div>
);

export default PreferenceToggle;
