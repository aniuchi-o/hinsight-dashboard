import { useHelpContent } from '../../../hooks/useHelp';
import HelpAccordion from '../HelpAccordion';
import LoadingSpinner from '../../common/LoadingSpinner';

const FAQSection = () => {
    const { data, isLoading } = useHelpContent();
    if (isLoading) return <LoadingSpinner />;
    if (!data) return null;
    return (
        <section>
            <h2 className="text-base font-semibold text-brand dark:text-brand-light mb-1">Frequently Asked Questions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Common questions about data interpretation, privacy compliance, and system behaviour.
            </p>
            <div className="space-y-2">
                {data.faq.map((item) => (
                    <HelpAccordion key={item.id} question={item.question} answer={item.answer} category={item.category} />
                ))}
            </div>
        </section>
    );
};

export default FAQSection;
