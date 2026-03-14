import { IGlossaryEntry } from '../../types/help.types';
import clsx from 'clsx';

interface GlossaryTableProps {
    entries: IGlossaryEntry[];
}

const CATEGORY_BADGE: Record<IGlossaryEntry['category'], string> = {
    CONTRIBUTING_FACTOR: 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light',
    CHRONIC_DISEASE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const GlossaryTable = ({ entries }: GlossaryTableProps) => {
    const factors = entries.filter((e) => e.category === 'CONTRIBUTING_FACTOR');
    const diseases = entries.filter((e) => e.category === 'CHRONIC_DISEASE');

    const renderGroup = (title: string, items: IGlossaryEntry[]) => (
        <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">{title}</h3>
            <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            {['Code', 'Full Name', 'Description', 'View'].map((h) => (
                                <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2.5">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {items.map((entry) => (
                            <tr key={entry.code} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-4 py-3">
                                    <span className={clsx('px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold', CATEGORY_BADGE[entry.category])}>
                                        {entry.code}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{entry.fullName}</td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs text-xs">{entry.description}</td>
                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize text-xs">{entry.relatedView}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            {renderGroup('Contributing Factors', factors)}
            {renderGroup('Chronic Diseases', diseases)}
        </div>
    );
};

export default GlossaryTable;
