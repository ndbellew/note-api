import "bootstrap/dist/css/bootstrap.min.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

import AboutUs from "./components/pages/AboutUs";
import AdminDashboard from "./components/pages/AdminDashboard";
import ContactUs from "./components/pages/ContactUs";
import Home from "./components/pages/Home";
import Login from "./components/pages/Login";
import Profile from "./components/pages/Profile";
import Register from "./components/pages/Register";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Layout from "./layout/Layout";
import Notes from "./components/pages/Notes";
import { fetchWithTokenRefresh } from "./utils/utils";

import "./App.css";

function App() {
  const [csrfToken, setCsrfToken] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { isAuthenticated, setIsAuthenticated, isAdmin, setIsAdmin } =
    useContext(AuthContext);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await fetchWithTokenRefresh("/api/get-csrf-token", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response?.ok) {
        const data = await response.json();
        console.log("CSRF Token:", data.csrf_token);
        setCsrfToken(data.csrf_token);
      } else {
        console.error("Failed to fetch CSRF token");
      }
    };

    const validateAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await fetchWithTokenRefresh("/api/auth/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response) {
          setIsAuthenticated(false);
          setIsAdmin(false);
          return;
        }

        const data = await response.json();

        if (data.isValid) {
          setIsAuthenticated(true);
          setIsAdmin(data.role === "admin");
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    void fetchCsrfToken();
    void validateAuth();
  }, []);

  if (isAuthLoading) {
    return <p>Loading...</p>;
  }
  console.log("CSRF Token: pre-return", csrfToken);
  return (
    <div className="container">
      <Layout>
        <Routes>
          <Route path="/AboutUs" element={<AboutUs />} />

          <Route path="/ContactUs" element={<ContactUs />} />

          <Route
            path="/Login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login csrfToken={csrfToken} />
              )
            }
          />
          <Route
            path="/Register"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Register csrfToken={csrfToken} />
              )
            }
          />

          <Route
            path="/Notes"
            element={
              <ProtectedRoutes
                element={Notes}
                isAuthenticated={isAuthenticated}
                csrfToken={csrfToken}
              />
            }
          />

          <Route
            path="/Profile/:username"
            element={
              <ProtectedRoutes
                isAuthenticated={isAuthenticated}
                element={Profile}
              />
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoutes
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                requireAdmin
                element={AdminDashboard}
              />
            }
          />

          <Route
            path="/"
            element={
              isAuthenticated ? <Notes csrfToken={csrfToken} /> : <Home />
            }
          />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
