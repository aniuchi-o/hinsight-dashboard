import { IMetricDefinition } from '../../types/help.types';
import { BarChart2 } from 'lucide-react';

interface MetricDefinitionCardProps {
    metric: IMetricDefinition;
}

const MetricDefinitionCard = ({ metric }: MetricDefinitionCardProps) => (
    <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card p-4">
        <div className="flex items-start gap-3">
            <BarChart2 size={18} className="text-brand shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{metric.displayName}</h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light font-medium">
                        {metric.chartType}
                    </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{metric.description}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <p className="text-gray-400 dark:text-gray-500 font-medium mb-0.5">Data source</p>
                        <p className="text-gray-700 dark:text-gray-300 font-mono text-[11px]">{metric.dataSource}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 dark:text-gray-500 font-medium mb-0.5">Aggregation</p>
                        <p className="text-gray-700 dark:text-gray-300">{metric.aggregationMethod}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-400 dark:text-gray-500 font-medium mb-0.5">Regulatory rationale</p>
                        <p className="text-emerald-700 dark:text-emerald-400">{metric.regulatoryRationale}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-400 dark:text-gray-500 font-medium mb-0.5">Appears on</p>
                        <div className="flex flex-wrap gap-1">
                            {metric.appearsOn.map((view) => (
                                <span key={view} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] capitalize">
                                    {view}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default MetricDefinitionCard;
