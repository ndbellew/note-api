import { fetchWithTokenRefresh } from "./utils/utils";
import { createContext, useEffect, useState } from "react";

// Create the AuthContext
export const AuthContext = createContext();

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetchWithTokenRefresh("/auth/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response && response.ok) {
          const data = await response.json();

          setIsAuthenticated(true);
          setIsAdmin(data.role === "admin");
          setUsername(data.username);
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUsername("");
        }
      }
    };

    validateToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        username,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
