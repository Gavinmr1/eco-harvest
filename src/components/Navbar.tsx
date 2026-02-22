import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 shadow">
      <Link to="/" className="text-xl font-bold">
        Eco Harvest
      </Link>
      <div className="space-x-4">
        <Link to="/">Home</Link>
        <Link to="/build-your-box">Build Your Box</Link>
        <Link to="/profile">Profile</Link>
        {user ? (
          <>
            <span className="text-sm text-gray-500">{user.email}</span>
            <button onClick={logout} className="text-red-500">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
