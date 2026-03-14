import { CheckCircle, AlertCircle } from 'lucide-react';
import { IComplianceAcknowledgement, IAcceptCompliancePayload } from '../../types/settings.types';
import clsx from 'clsx';

interface CompliancePanelProps {
    compliance: IComplianceAcknowledgement;
    onAccept: (noticeType: IAcceptCompliancePayload['noticeType']) => void;
    isAccepting: boolean;
}

const ComplianceNoticePanel = ({ compliance, onAccept, isAccepting }: CompliancePanelProps) => {
    const notices: {
        type: IAcceptCompliancePayload['noticeType'];
        label: string;
        acceptedAt: string | null;
        region: string;
    }[] = [
            { type: 'HIPAA', label: 'HIPAA Privacy & Security Rule', acceptedAt: compliance.hipaaNoticeAcceptedAt, region: 'Required for U.S. data access' },
            { type: 'PHIPA', label: 'PHIPA — Personal Health Information Protection Act', acceptedAt: compliance.phipaNoticeAcceptedAt, region: 'Required for Canadian data access' },
            { type: 'DATA_RETENTION', label: `Data Retention Policy (v${compliance.dataRetentionPolicyVersion})`, acceptedAt: compliance.lastPolicyReviewedAt, region: 'All regions' },
        ];

    return (
        <div className="space-y-3">
            {notices.map(({ type, label, acceptedAt, region }) => {
                const needsReview = compliance.requiresReacceptance && !acceptedAt;
                return (
                    <div key={type} className={clsx(
                        'flex items-center justify-between gap-4 p-3 rounded-lg',
                        needsReview ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700'
                            : 'bg-gray-50 dark:bg-gray-800/50'
                    )}>
                        <div className="flex items-start gap-2">
                            {acceptedAt && !needsReview
                                ? <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                : <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                            }
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{region}</p>
                                {acceptedAt && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        Accepted: {new Date(acceptedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                        {(!acceptedAt || needsReview) && (
                            <button
                                onClick={() => onAccept(type)}
                                disabled={isAccepting}
                                className="shrink-0 px-3 py-1.5 text-xs bg-brand text-white rounded-lg
                           hover:bg-brand-dark transition-colors disabled:opacity-50"
                            >
                                {needsReview ? 'Re-accept' : 'Accept'}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ComplianceNoticePanel;
