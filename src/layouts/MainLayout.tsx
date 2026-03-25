import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="bg-background flex h-full min-h-screen w-full grow flex-col">
      <main className="relative z-10 mx-auto flex h-full w-full grow flex-col">
        <div className="backgroundGradientImage pointer-events-none absolute left-0 z-0 flex min-h-full w-screen grow bg-cover bg-no-repeat" />
        <div className="relative z-10 flex h-full w-full grow flex-col">
          <Navbar />
          <Outlet />
        </div>
      </main>

      <footer className="bg-background-dimmed1 text-foreground-dimmed1 px-appSpacing py-appInnerSpacing z-10 w-full text-center shadow-xl">
        &copy; {new Date().getFullYear()} Eco Harvest. All rights reserved.
      </footer>
    </div>
  );
}
