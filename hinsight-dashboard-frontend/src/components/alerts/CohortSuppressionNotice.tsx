import { Info } from 'lucide-react';

interface CohortSuppressionNoticeProps {
    metric?: string;
}

const CohortSuppressionNotice = ({ metric }: CohortSuppressionNoticeProps) => (
    <div className="flex items-start gap-2 p-3 rounded-lg
                  bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700
                  text-xs text-blue-700 dark:text-blue-400">
        <Info size={14} className="shrink-0 mt-0.5" />
        <div>
            <strong>Data suppressed</strong>
            {metric && <span> — {metric}</span>}
            <span className="ml-1">
                This metric has been suppressed because the underlying cohort contains fewer than 10
                employees, per HIPAA/PHIPA k-anonymity requirements.
            </span>
        </div>
    </div>
);

export default CohortSuppressionNotice;
