import { Suspense, useCallback, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import PageLoaderGate from "../components/PageLoaderGate";
import Typography from "../components/Typography";
import { PageLoaderContext } from "../contexts/PageLoaderContext";
import veggiesBgImage from "../assets/images/veggies-bg.webp";

type LoaderRequest = {
  id: string;
  label: string;
};

export default function MainLayout() {
  const [loaderRequests, setLoaderRequests] = useState<LoaderRequest[]>([]);
  const isLoaderActive = loaderRequests.length > 0;

  const setRequest = useCallback((id: string, label: string) => {
    setLoaderRequests(currentRequests => [
      ...currentRequests.filter(request => request.id !== id),
      { id, label },
    ]);
  }, []);

  const clearRequest = useCallback((id: string) => {
    setLoaderRequests(currentRequests => currentRequests.filter(request => request.id !== id));
  }, []);

  const pageLoaderContextValue = useMemo(
    () => ({ setRequest, clearRequest }),
    [clearRequest, setRequest]
  );

  const activeLoaderLabel = loaderRequests.at(-1)?.label ?? "Loading...";

  return (
    <PageLoaderContext.Provider value={pageLoaderContextValue}>
      <div className="bg-background flex h-full min-h-screen w-full grow flex-col">
        <main className="relative mx-auto flex h-full w-full grow flex-col">
          <div className="backgroundGradientImage pointer-events-none absolute left-0 z-0 flex min-h-full w-screen grow bg-cover bg-no-repeat" />
          <div className="relative z-11 flex h-full w-full grow flex-col">
            <Navbar />
            <div className="relative flex w-full grow flex-col">
              <Suspense fallback={<PageLoaderGate label="Loading Page..." />}>
                <Outlet />
              </Suspense>
              <div
                className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-150 ${isLoaderActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <Loader label={activeLoaderLabel} active={isLoaderActive} />
              </div>
            </div>
            <footer className="bg-background-dimmed1 text-foreground-dimmed1 px-appSpacing py-appInnerSpacing z-1 w-full text-center shadow-xl">
              <Typography as="p" variant="muted">
                &copy; {new Date().getFullYear()} Eco Harvest. All rights reserved.
              </Typography>
            </footer>
            <div
              className="mask-fade fixed top-0 left-0 z-0 h-screen w-full bg-cover bg-no-repeat"
              style={{ backgroundImage: `url(${veggiesBgImage})` }}
            />
          </div>
        </main>
      </div>
    </PageLoaderContext.Provider>
  );
}
