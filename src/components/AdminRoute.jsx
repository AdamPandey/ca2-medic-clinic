import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function AdminRoute() {
    const { user } = useAuth();
    const location = useLocation();

    // Check role
    if (user.role !== 'admin') {
        // Redirect to User Dashboard, but carry the "denied" state
        return <Navigate 
            to="/user-dashboard" 
            replace 
            state={{ accessDenied: true, from: location.pathname }} 
        />;
    }

    return <Outlet />;
};