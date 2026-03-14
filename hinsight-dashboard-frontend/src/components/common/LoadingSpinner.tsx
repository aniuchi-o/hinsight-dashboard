const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-16">
        <div
            className="w-10 h-10 rounded-full border-4 border-brand/20 border-t-brand animate-spin"
            role="status"
            aria-label="Loading"
        />
    </div>
);

export default LoadingSpinner;
