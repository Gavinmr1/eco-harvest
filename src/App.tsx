import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import LeafLoader from "./components/LeafLoader";

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Profile = lazy(() => import("./pages/Profile"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const BuildYourBox = lazy(() => import("./pages/BuildYourBox"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const MyOrders = lazy(() => import("./pages/MyOrders"));

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-6">
          <LeafLoader label="Loading page" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<FAQ />} />
          <Route
            path="build-your-box"
            element={
              <PrivateRoute>
                <BuildYourBox />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="orders"
            element={
              <PrivateRoute>
                <MyOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
