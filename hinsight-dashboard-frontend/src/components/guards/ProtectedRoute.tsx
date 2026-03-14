import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
    requiredPermission?: string;
    redirectTo?: string;
}

/**
 * SECURITY INVARIANT:
 * Single enforcement point for RBAC on all dashboard routes.
 * No dashboard page is accessible without passing through this guard.
 * Backend MUST also enforce the same permissions — this is defense in depth.
 */
const ProtectedRoute = ({
    requiredPermission,
    redirectTo = '/login',
}: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();
    const location = useLocation();

    if (isLoading) return <LoadingSpinner />;

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
