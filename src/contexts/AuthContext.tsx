import { createContext } from "react";
import { type User } from "firebase/auth";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  adminLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdminStatus: (force?: boolean) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);
