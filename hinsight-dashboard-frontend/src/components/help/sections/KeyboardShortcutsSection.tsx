import { useHelpContent } from '../../../hooks/useHelp';
import KeyboardShortcutsTable from '../KeyboardShortcutsTable';
import LoadingSpinner from '../../common/LoadingSpinner';

const KeyboardShortcutsSection = () => {
    const { data, isLoading } = useHelpContent();
    if (isLoading) return <LoadingSpinner />;
    if (!data) return null;

    // Sort by shortcut key: numbers 1→4 first, then letters A→Z
    const keyOrder = ['1', '2', '3', '4', 'A', 'D', 'H', 'R', 'S'];
    const sorted = [...data.keyboardShortcuts].sort((a, b) => {
        const aKey = a.keys[a.keys.length - 1].toUpperCase();
        const bKey = b.keys[b.keys.length - 1].toUpperCase();
        const aIdx = keyOrder.indexOf(aKey);
        const bIdx = keyOrder.indexOf(bKey);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return aKey.localeCompare(bKey);
    });

    return (
        <section>
            <h2 className="text-base font-semibold text-brand dark:text-brand-light mb-1">Keyboard Shortcuts</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Navigate HINSIGHT without a mouse. Compliant with WCAG 2.1 keyboard accessibility requirements.
                All shortcuts use the{' '}
                <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono border border-gray-300 dark:border-gray-600">
                    Alt
                </kbd>{' '}
                modifier.
            </p>
            <KeyboardShortcutsTable shortcuts={sorted} />
        </section>
    );
};

export default KeyboardShortcutsSection;
