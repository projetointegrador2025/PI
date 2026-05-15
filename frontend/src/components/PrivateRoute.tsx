import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedGroups: string[];
}

export function PrivateRoute({ children, allowedGroups }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const hasAccess = allowedGroups.some((g) => user.groups.includes(g));
  if (!hasAccess) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
