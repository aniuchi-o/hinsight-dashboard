interface UnreadAlertsBadgeProps {
    count: number;
}

const UnreadAlertsBadge = ({ count }: UnreadAlertsBadgeProps) => {
    if (count <= 0) return null;
    return (
        <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                 bg-rose-500 text-white text-[10px] font-bold
                 rounded-full flex items-center justify-center
                 ring-2 ring-brand dark:ring-brand-dark"
            aria-label={`${count} unread alert${count !== 1 ? 's' : ''}`}
        >
            {count > 99 ? '99+' : count}
        </span>
    );
};

export default UnreadAlertsBadge;
