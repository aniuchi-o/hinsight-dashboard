import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { IFAQItem } from '../../types/help.types';

const CATEGORY_COLORS: Record<IFAQItem['category'], string> = {
    DATA_INTERPRETATION: 'text-brand dark:text-brand-light',
    PRIVACY_COMPLIANCE: 'text-emerald-600 dark:text-emerald-400',
    TECHNICAL: 'text-blue-600 dark:text-blue-400',
    GENERAL: 'text-gray-500 dark:text-gray-400',
};

interface HelpAccordionProps {
    question: string;
    answer: string;
    category: IFAQItem['category'];
}

const HelpAccordion = ({ question, answer, category }: HelpAccordionProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-card shadow-card overflow-hidden">
            <button
                onClick={() => setIsOpen((p) => !p)}
                className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left
                   hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <span className={clsx('text-[10px] font-semibold uppercase tracking-wider', CATEGORY_COLORS[category])}>
                        {category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{question}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={clsx('text-gray-400 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
                />
            </button>
            {isOpen && (
                <div className="px-4 pb-4 pt-1 text-sm text-gray-600 dark:text-gray-400
                        border-t border-gray-100 dark:border-gray-700">
                    {answer}
                </div>
            )}
        </div>
    );
};

export default HelpAccordion;
