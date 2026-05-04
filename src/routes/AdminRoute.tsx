import { Navigate } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";
import { useAuth } from "../hooks/useAuth";
import PageLoaderGate from "../components/PageLoaderGate";
import Typography from "../components/Typography";

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
    return <PageLoaderGate label="Loading Admin Access..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="z-10 mx-auto flex w-full max-w-2xl flex-col gap-3 p-6">
        <Typography as="h1">Admin Access Required</Typography>
        <Typography as="p" variant="muted">
          Signed in as <Typography as="strong">{user.email ?? user.uid}</Typography>, but this
          account does not currently have the <Typography as="strong">admin</Typography> custom
          claim.
        </Typography>
        <Typography as="p" variant="muted">
          Run:{" "}
          <Typography as="strong">
            npm run set:admin -- --email {user.email ?? "<email>"}
          </Typography>
        </Typography>
        <Typography as="p" variant="muted">
          For local testing, you can also set{" "}
          <Typography as="strong">VITE_ADMIN_ALLOWLIST_EMAILS</Typography> in
          <Typography as="strong"> .env</Typography> (comma-separated emails).
        </Typography>
      </div>
    );
  }

  return children;
}
