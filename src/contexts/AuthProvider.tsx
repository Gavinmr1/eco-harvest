import { useEffect, useState, type JSX } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

const ADMIN_ALLOWLIST_EMAILS = new Set(
  (import.meta.env.VITE_ADMIN_ALLOWLIST_EMAILS ?? "")
    .split(",")
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
);

const isAllowlistedAdmin = (email?: string | null) =>
  email ? ADMIN_ALLOWLIST_EMAILS.has(email.trim().toLowerCase()) : false;

export const AuthProvider = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState<boolean>(true);

  const refreshAdminStatus = async (force = false): Promise<boolean> => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      setIsAdmin(false);
      setAdminLoading(false);
      return false;
    }

    setAdminLoading(true);
    const hasAllowlistAdmin = isAllowlistedAdmin(firebaseUser.email);

    try {
      const tokenResult = await firebaseUser.getIdTokenResult(force);
      const hasAdminClaim = Boolean(tokenResult.claims.admin);
      const hasAdminAccess = hasAdminClaim || hasAllowlistAdmin;
      setIsAdmin(hasAdminAccess);
      return hasAdminAccess;
    } catch {
      setIsAdmin(hasAllowlistAdmin);
      return hasAllowlistAdmin;
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser);
      setLoading(false);
      void refreshAdminStatus(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const trimmedFullName = fullName.trim();

    if (trimmedFullName) {
      await updateProfile(credential.user, { displayName: trimmedFullName });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, adminLoading, isAdmin, login, signup, logout, refreshAdminStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};
