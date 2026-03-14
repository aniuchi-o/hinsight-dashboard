import { ReactNode } from 'react';

interface SettingsSectionProps {
    title: string;
    description: string;
    children: ReactNode;
}

const SettingsSection = ({ title, description, children }: SettingsSectionProps) => (
    <section className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-6">
        <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-semibold text-brand dark:text-brand-light">{title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        {children}
    </section>
);

export default SettingsSection;
