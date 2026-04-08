import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader label="Loading account" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}
