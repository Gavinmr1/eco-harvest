import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";
import backgroundGradientImage from "../assets/images/background-gradient.jpg";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx("hover:underline px-2 py-1", {
    "text-primary font-semibold": isActive,
    "text-gray-700": !isActive,
  });

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-background flex h-full min-h-screen w-full grow flex-col">
      <header className="bg-primary text-primary-foreground w-full">
        <nav className="px-appSpacing max-w-9xl mx-auto flex h-12 w-full items-center justify-between md:h-16">
          <NavLink to="/" className="text-2xl font-bold">
            Eco Harvest
          </NavLink>
          <ul className="flex space-x-4">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  clsx(navLinkClass({ isActive }), {
                    "bg-green-900": isActive,
                  })
                }
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  clsx(navLinkClass({ isActive }), {
                    "bg-green-900": isActive,
                  })
                }
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  clsx(navLinkClass({ isActive }), {
                    "bg-green-900": isActive,
                  })
                }
              >
                Profile
              </NavLink>
            </li>
            {user ? (
              <button onClick={logout} className="hover:underline">
                Logout
              </button>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
            )}
          </ul>
        </nav>
      </header>

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
