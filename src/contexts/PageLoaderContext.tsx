import { createContext } from "react";

interface PageLoaderContextValue {
  setRequest: (id: string, label: string) => void;
  clearRequest: (id: string) => void;
}

export const PageLoaderContext = createContext<PageLoaderContextValue | undefined>(undefined);
