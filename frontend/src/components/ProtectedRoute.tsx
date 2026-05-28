import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/useAuth";

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
