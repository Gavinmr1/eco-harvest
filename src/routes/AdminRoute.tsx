import { Navigate } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, loading, adminLoading, isAdmin, refreshAdminStatus } = useAuth();
  const [forceRefreshingAdmin, setForceRefreshingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminClaim = async () => {
      if (!user) {
        setForceRefreshingAdmin(false);
        return;
      }

      try {
        await refreshAdminStatus(true);
      } finally {
        setForceRefreshingAdmin(false);
      }
    };

    void checkAdminClaim();
  }, [refreshAdminStatus, user]);

  if (loading || adminLoading || forceRefreshingAdmin) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 p-6">
        <h1 className="text-primary text-2xl font-semibold">Admin Access Required</h1>
        <p className="text-foreground-dimmed2 text-sm">
          Signed in as <strong>{user.email ?? user.uid}</strong>, but this account does not
          currently have the <strong>admin</strong> custom claim.
        </p>
        <p className="text-foreground-dimmed2 text-sm">
          Run: <strong>npm run set:admin -- --email {user.email ?? "<email>"}</strong>
        </p>
      </div>
    );
  }

  return children;
}
