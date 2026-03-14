import { useHelpContent } from '../../../hooks/useHelp';
import GlossaryTable from '../GlossaryTable';
import LoadingSpinner from '../../common/LoadingSpinner';

const GlossarySection = () => {
    const { data, isLoading } = useHelpContent();
    if (isLoading) return <LoadingSpinner />;
    if (!data) return null;
    return (
        <section>
            <h2 className="text-base font-semibold text-brand dark:text-brand-light mb-1">Terms &amp; Definitions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                All metric codes used in HINSIGHT, mapped to plain-language descriptions for correct interpretation.
            </p>
            <GlossaryTable entries={data.glossary} />
        </section>
    );
};

export default GlossarySection;
