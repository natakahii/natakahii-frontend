import { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../providers/AuthProvider';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex items-center justify-center px-4">
      <div className="bg-white border border-[var(--color-border)] rounded-[24px] px-8 py-6 shadow-[var(--shadow-level-2)] text-center">
        <div className="w-10 h-10 mx-auto border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="mt-4 text-[14px] font-semibold text-[var(--color-text-heading)]">Checking your session...</p>
      </div>
    </div>
  );
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { defaultRoute, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function RequireRole({
  children,
  redirectTo,
  roles,
}: {
  children: ReactNode;
  redirectTo: string;
  roles: string[];
}) {
  const { hasRole, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!roles.some((role) => hasRole(role))) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export function RequireMissingRole({
  children,
  redirectTo,
  role,
}: {
  children: ReactNode;
  redirectTo: string;
  role: string;
}) {
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (hasRole(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
