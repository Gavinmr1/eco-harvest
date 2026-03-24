import { useEffect, useState, type JSX } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { AuthContext } from "./AuthContext";

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
    try {
      const tokenResult = await firebaseUser.getIdTokenResult(force);
      const hasAdminClaim = Boolean(tokenResult.claims.admin);
      setIsAdmin(hasAdminClaim);
      return hasAdminClaim;
    } catch {
      setIsAdmin(false);
      return false;
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

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
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
