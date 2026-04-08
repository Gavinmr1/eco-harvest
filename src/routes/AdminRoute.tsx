import { Navigate } from "react-router-dom";
import { useEffect, useState, type JSX } from "react";
import { useAuth } from "../hooks/useAuth";
import Typography from "../components/Typography";
import Loader from "../components/Loader";

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
    return (
      <div className="flex items-center justify-center p-6">
        <Loader label="Loading admin access" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 p-6">
        <Typography as="h1" className="text-primary text-2xl font-semibold">
          Admin Access Required
        </Typography>
        <Typography as="p" className="text-foreground-dimmed2 text-sm">
          Signed in as <Typography as="strong">{user.email ?? user.uid}</Typography>, but this
          account does not currently have the <Typography as="strong">admin</Typography> custom
          claim.
        </Typography>
        <Typography as="p" className="text-foreground-dimmed2 text-sm">
          Run:{" "}
          <Typography as="strong">
            npm run set:admin -- --email {user.email ?? "<email>"}
          </Typography>
        </Typography>
      </div>
    );
  }

  return children;
}
