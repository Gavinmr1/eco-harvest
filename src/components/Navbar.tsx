import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";
import HomeIcon from "../assets/svgs/home.svg?react";
import BoxIcon from "../assets/svgs/box.svg?react";
import ProfileIcon from "../assets/svgs/profile.svg?react";
import LoginIcon from "../assets/svgs/login.svg?react";
import SignUpIcon from "../assets/svgs/signup.svg?react";
import LogoutIcon from "../assets/svgs/logout.svg?react";
import MenuIcon from "../assets/svgs/menu.svg?react";
import CloseIcon from "../assets/svgs/close.svg?react";

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx("px-2 py-1 transition-colors hover:underline", {
    "bg-green-900 font-semibold": isActive,
  });

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx("flex items-center gap-2 rounded px-3 py-2 transition-colors hover:bg-background-dimmed1", {
    "bg-background-dimmed1 font-semibold": isActive,
  });

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileNavOpen(false);
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isMobileNavOpen]);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileNavOpen]);

  const handleLogout = async () => {
    setIsMobileNavOpen(false);
    await logout();
  };

  return (
    <>
      <header className="bg-primary text-primary-foreground border-background-border w-full border-b">
        <nav className="px-appSpacing max-w-9xl mx-auto flex h-12 w-full items-center justify-between md:h-16">
          <NavLink to="/" className="text-2xl font-bold">
            Eco Harvest
          </NavLink>

          {/* Desktop */}
          <ul className="hidden items-center gap-2 md:flex">
            <li>
              <NavLink to="/" end className={desktopLinkClass}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={desktopLinkClass}>
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/build-your-box" className={desktopLinkClass}>
                Build Your Box
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={desktopLinkClass}>
                Profile
              </NavLink>
            </li>

            {user && (
              <li>
                <NavLink to="/orders" className={desktopLinkClass}>
                  My Orders
                </NavLink>
              </li>
            )}

            {user && isAdmin && (
              <li>
                <NavLink to="/admin" className={desktopLinkClass}>
                  Admin
                </NavLink>
              </li>
            )}

            {user ? (
              <li>
                <button type="button" onClick={handleLogout} className="px-2 py-1 hover:underline">
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <NavLink to="/login" className={desktopLinkClass}>
                  Login
                </NavLink>
              </li>
            )}
          </ul>

          {/* Mobile open button */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav"
            className="hover:bg-background-dimmed1 rounded p-2 transition-colors md:hidden"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity md:hidden ${
          isMobileNavOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsMobileNavOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        id="mobile-nav"
        aria-label="Mobile navigation"
        className={`bg-background border-background-border fixed top-0 right-0 z-50 h-full w-72 border-l p-4 shadow-lg transition-transform duration-300 ease-out md:hidden ${
          isMobileNavOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-lg font-semibold">Menu</p>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="hover:bg-background-dimmed1 rounded p-2 transition-colors"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={mobileLinkClass}>
            <HomeIcon className="h-4 w-4" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/about" className={mobileLinkClass}>
            <span>About</span>
          </NavLink>

          <NavLink to="/build-your-box" className={mobileLinkClass}>
            <BoxIcon className="h-4 w-4" />
            <span>Build Your Box</span>
          </NavLink>

          <NavLink to="/profile" className={mobileLinkClass}>
            <ProfileIcon className="h-4 w-4" />
            <span>Profile</span>
          </NavLink>

          {user && (
            <NavLink to="/orders" className={mobileLinkClass}>
              <span>My Orders</span>
            </NavLink>
          )}

          {user && isAdmin && (
            <NavLink to="/admin" className={mobileLinkClass}>
              <span>Admin</span>
            </NavLink>
          )}

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hover:bg-background-dimmed1 flex items-center gap-2 rounded px-3 py-2 text-left text-red-500 transition-colors"
            >
              <LogoutIcon className="h-4 w-4" />
              <span>Logout</span>
            </button>
          ) : (
            <>
              <NavLink to="/login" className={mobileLinkClass}>
                <LoginIcon className="h-4 w-4" />
                <span>Login</span>
              </NavLink>
              <NavLink to="/signup" className={mobileLinkClass}>
                <SignUpIcon className="h-4 w-4" />
                <span>Signup</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
