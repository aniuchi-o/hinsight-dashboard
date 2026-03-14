import { useHelpContent } from '../../../hooks/useHelp';
import MetricDefinitionCard from '../MetricDefinitionCard';
import LoadingSpinner from '../../common/LoadingSpinner';

const MetricDefinitionsSection = () => {
    const { data, isLoading } = useHelpContent();
    if (isLoading) return <LoadingSpinner />;
    if (!data) return null;
    return (
        <section>
            <h2 className="text-base font-semibold text-brand dark:text-brand-light mb-1">Metric Definitions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Each chart and KPI tile defined with data source, aggregation method, and regulatory rationale.
            </p>
            <div className="space-y-4">
                {data.metricDefinitions.map((metric) => (
                    <MetricDefinitionCard key={metric.metricId} metric={metric} />
                ))}
            </div>
        </section>
    );
};

export default MetricDefinitionsSection;
