import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../hooks/useAuth";
import HomeIcon from "../assets/svgs/home.svg?react";
import PackageIcon from "../assets/svgs/package.svg?react";
import AboutIcon from "../assets/svgs/globe.svg?react";
import ProfileIcon from "../assets/svgs/profile.svg?react";
import LoginIcon from "../assets/svgs/login.svg?react";
import TruckIcon from "../assets/svgs/truck.svg?react";
import LeafIcon from "../assets/svgs/leaf.svg?react";
import FAQIcon from "../assets/svgs/question.svg?react";
import SignUpIcon from "../assets/svgs/signup.svg?react";
import LogoutIcon from "../assets/svgs/logout.svg?react";
import MenuIcon from "../assets/svgs/menu.svg?react";
import CloseIcon from "../assets/svgs/close.svg?react";

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "rounded-full text-white bg-white/20 duration-300 gap-2 py-2 px-5 flex items-center hover:bg-white/30 transition-all overflow-hidden whitespace-nowrap",
    {
      "text-foreground bg-yellow-500 hover:bg-yellow-500 [&_svg]:text-foreground": isActive,
    }
  );

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx("flex items-center gap-2 rounded px-3 py-2 transition-colors hover:bg-background-dimmed1", {
    "bg-yellow-500 hover:bg-yellow-500 [&_svg]:text-foreground": isActive,
  });

const iconStyles = "flex size-5 shrink-0 md:hidden text-foreground-dimmed4";

const dropdownLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx("flex items-center gap-2 px-4 py-2 text-white transition-all hover:bg-white/10", {
    "bg-yellow-500 hover:bg-yellow-500 font-medium [&_svg]:text-foreground": isActive,
  });

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const getUserInitials = (user: { displayName?: string | null; email?: string | null }) => {
    return user.displayName
      ? user.displayName
          .split(" ")
          .map(n => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : (user.email?.[0] ?? "?").toUpperCase();
  };

  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsProfileMenuOpen(false);
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

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    setIsMobileNavOpen(false);
    setIsProfileMenuOpen(false);
    await logout();
  };

  return (
    <>
      <header
        className={clsx(
          "text-primary-foreground sticky top-0 z-10 w-full transition-all duration-300",
          hasScrolled
            ? "border-b border-white/10 bg-white/10 shadow-lg backdrop-blur-lg"
            : "border-transparent bg-transparent shadow-none"
        )}
      >
        <nav className="px-appSpacing max-w-9xl py-appInnerSpacing mx-auto flex w-full items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-2xl font-semibold">
            <LeafIcon className="flex size-8 shrink-0" />
            Eco Harvest
          </NavLink>

          {/* Desktop */}
          <ul className="group/nav relative hidden items-center gap-2 rounded-full bg-black/10 p-1 shadow-lg backdrop-blur-lg md:flex">
            <li>
              <NavLink to="/" end className={desktopLinkClass}>
                <HomeIcon className={iconStyles} />
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={desktopLinkClass}>
                <AboutIcon className={iconStyles} />
                About
              </NavLink>
            </li>
            <li>
              <NavLink to="/faq" className={desktopLinkClass}>
                <FAQIcon className={iconStyles} />
                FAQ
              </NavLink>
            </li>
            {user && isAdmin && (
              <li>
                <NavLink to="/admin" className={desktopLinkClass}>
                  <PackageIcon className={iconStyles} />
                  Admin
                </NavLink>
              </li>
            )}
          </ul>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative hidden md:flex" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(o => !o)}
                  aria-label="Open profile menu"
                  aria-expanded={isProfileMenuOpen}
                  className="flex size-10 items-center justify-center rounded-full bg-yellow-500 text-base font-semibold text-white shadow transition-all duration-300 hover:bg-yellow-400"
                >
                  {getUserInitials(user)}
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-lg backdrop-blur-lg">
                    <div className="flex flex-col gap-1 py-1">
                      <NavLink
                        to="/profile"
                        className={dropdownLinkClass}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <ProfileIcon className="size-4 shrink-0" />
                        Profile
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className={dropdownLinkClass}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <TruckIcon className="size-4 shrink-0" />
                        Orders
                      </NavLink>
                      <NavLink
                        to="/build-your-box"
                        className={dropdownLinkClass}
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <PackageIcon className="size-4 shrink-0" />
                        Build Your Box
                      </NavLink>

                      <hr className="my-1 border-white/10" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-left text-red-400 transition-all hover:bg-white/10"
                      >
                        <LogoutIcon className="size-4 shrink-0" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden gap-2 sm:flex">
                <NavLink to="/signup" className="btn-secondary px-5 py-2">
                  <SignUpIcon className={clsx(iconStyles, "sm:hidden")} />
                  Signup
                </NavLink>
                <NavLink to="/login" className="btn-tertiary px-5 py-2">
                  <LoginIcon className={clsx(iconStyles, "sm:hidden")} />
                  Login
                </NavLink>
              </div>
            )}

            {/* Mobile open button */}
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-nav"
              className="cursor-pointer rounded p-1 transition-colors hover:bg-black/10 hover:backdrop-blur-lg md:hidden"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <MenuIcon className="size-8" />
            </button>
          </div>
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
        className={`bg-background/50 border-background-border fixed top-0 right-0 z-50 h-full w-72 border-l p-4 shadow-lg backdrop-blur-lg transition-transform duration-300 md:hidden ${
          isMobileNavOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col gap-2">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="ml-auto cursor-pointer rounded p-1 transition-colors hover:bg-white/10 hover:backdrop-blur-lg"
            onClick={() => setIsMobileNavOpen(false)}
          >
            <CloseIcon className="h-5 w-5" />
          </button>

          <NavLink to="/" end className={mobileLinkClass}>
            <HomeIcon className={iconStyles} />
            Home
          </NavLink>
          <NavLink to="/about" className={mobileLinkClass}>
            <AboutIcon className={iconStyles} />
            About
          </NavLink>
          <NavLink to="/faq" className={mobileLinkClass}>
            <FAQIcon className={iconStyles} />
            FAQ
          </NavLink>
          {user && isAdmin && (
            <NavLink to="/admin" className={mobileLinkClass}>
              <PackageIcon className={iconStyles} />
              Admin
            </NavLink>
          )}
          {user && (
            <>
              <NavLink
                to="/profile"
                className={mobileLinkClass}
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <ProfileIcon className={iconStyles} />
                Profile
              </NavLink>
              <NavLink
                to="/orders"
                className={mobileLinkClass}
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <TruckIcon className={iconStyles} />
                Orders
              </NavLink>
              <NavLink
                to="/build-your-box"
                className={mobileLinkClass}
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <PackageIcon className={iconStyles} />
                Build Your Box
              </NavLink>
            </>
          )}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="btn-tertiary mt-auto w-full px-3 py-2"
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
