import { IRegulatoryNotice } from '../../types/help.types';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface RegulatoryNoticeBlockProps {
    notice: IRegulatoryNotice;
}

const FRAMEWORK_COLORS: Record<IRegulatoryNotice['framework'], string> = {
    HIPAA: 'border-blue-400  bg-blue-50  dark:bg-blue-900/20',
    PHIPA: 'border-red-400   bg-red-50   dark:bg-red-900/20',
    PIPEDA: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
    SAMD: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
};

const RegulatoryNoticeBlock = ({ notice }: RegulatoryNoticeBlockProps) => (
    <div className={`rounded-card border-l-4 p-4 ${FRAMEWORK_COLORS[notice.framework]}`}>
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-brand dark:text-brand-light uppercase tracking-wider">
                            {notice.framework}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            · Regions: {notice.applicableRegions.join(', ')}
                        </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{notice.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{notice.summary}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
                        Last reviewed: {new Date(notice.lastReviewedAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <a
                href={notice.fullPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 text-xs text-brand dark:text-brand-light hover:underline"
            >
                Full policy <ExternalLink size={10} />
            </a>
        </div>
    </div>
);

export default RegulatoryNoticeBlock;
