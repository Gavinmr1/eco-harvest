import { usePageLoader } from "../hooks/usePageLoader";

type PageLoaderGateProps = {
  active?: boolean;
  label: string;
};

export default function PageLoaderGate({ active = true, label }: PageLoaderGateProps) {
  usePageLoader(active, label);
  return null;
}
