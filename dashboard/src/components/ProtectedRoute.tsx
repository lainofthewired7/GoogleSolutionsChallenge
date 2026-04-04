import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-background text-on-surface">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>
          <span className="font-headline font-bold text-sm tracking-widest uppercase opacity-70">Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to landing page but save the attempted location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
