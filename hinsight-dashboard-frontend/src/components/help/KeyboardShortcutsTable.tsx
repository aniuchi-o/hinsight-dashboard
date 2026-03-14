import { IKeyboardShortcut } from '../../types/help.types';

interface KeyboardShortcutsTableProps {
    shortcuts: IKeyboardShortcut[];
}

const KeyboardShortcutsTable = ({ shortcuts }: KeyboardShortcutsTableProps) => (
    <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                    {['Shortcut', 'Description', 'Context'].map((h) => (
                        <th key={h} className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2.5">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {shortcuts.map((sc, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-1 flex-wrap">
                                {sc.keys.map((key) => (
                                    <kbd key={key}
                                        className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700
                               border border-gray-300 dark:border-gray-600
                               text-xs font-mono text-gray-700 dark:text-gray-300">
                                        {key}
                                    </kbd>
                                ))}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{sc.description}</td>
                        <td className="px-4 py-3 text-gray-400 dark:text-gray-500">{sc.context}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default KeyboardShortcutsTable;
