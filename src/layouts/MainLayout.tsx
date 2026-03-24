import { Outlet } from "react-router-dom";
import backgroundGradientImage from "../assets/images/background-gradient.webp";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="bg-background flex h-full min-h-screen w-full grow flex-col">
      <Navbar />

      <main className="relative z-10 mx-auto flex h-full w-full grow flex-col">
        <div
          className="pointer-events-none absolute left-0 z-0 flex min-h-full w-screen grow bg-cover bg-no-repeat opacity-10 hue-rotate-290 dark:opacity-30"
          style={{ backgroundImage: `url(${backgroundGradientImage})` }}
        />
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>

      <footer className="bg-background-dimmed2 text-foreground-dimmed1 px-appSpacing py-appInnerSpacing w-full text-center">
        &copy; {new Date().getFullYear()} Eco Harvest. All rights reserved.
      </footer>
    </div>
  );
}
