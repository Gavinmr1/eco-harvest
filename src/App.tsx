import { lazy, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import MainLayout from "./layouts/MainLayout";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Account = lazy(() => import("./pages/Account"));
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const BuildYourBox = lazy(() => import("./pages/BuildYourBox"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

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
          path="account"
          element={
            <PrivateRoute>
              <Account />
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
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>
    </Routes>
  );
}
