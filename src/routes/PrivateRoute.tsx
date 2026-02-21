import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}