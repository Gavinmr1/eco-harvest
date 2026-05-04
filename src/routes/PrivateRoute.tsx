import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuth } from "../hooks/useAuth";
import PageLoaderGate from "../components/PageLoaderGate";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <PageLoaderGate label="Loading Account..." />;
  }
  return user ? children : <Navigate to="/login" />;
}
