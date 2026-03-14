import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

const Card = ({ children, className, title }: CardProps) => (
    <div
        className={clsx(
            'bg-card-light dark:bg-card-dark rounded-card shadow-card p-5',
            className
        )}
    >
        {title && (
            <h2 className="text-sm font-semibold text-brand dark:text-brand-light mb-4 uppercase tracking-wide">
                {title}
            </h2>
        )}
        {children}
    </div>
);

export default Card;
