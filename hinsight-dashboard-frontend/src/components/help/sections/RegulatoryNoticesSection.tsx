import { useHelpContent } from '../../../hooks/useHelp';
import RegulatoryNoticeBlock from '../RegulatoryNoticeBlock';
import LoadingSpinner from '../../common/LoadingSpinner';

const RegulatoryNoticesSection = () => {
    const { data, isLoading } = useHelpContent();
    if (isLoading) return <LoadingSpinner />;
    if (!data) return null;
    return (
        <section>
            <h2 className="text-base font-semibold text-brand dark:text-brand-light mb-1">Regulatory Notices</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                HINSIGHT operates under HIPAA (U.S.) and PHIPA (Canada). Compliance declarations below.
            </p>
            <div className="space-y-4">
                {data.regulatoryNotices.map((notice) => (
                    <RegulatoryNoticeBlock key={notice.id} notice={notice} />
                ))}
            </div>
        </section>
    );
};

export default RegulatoryNoticesSection;
