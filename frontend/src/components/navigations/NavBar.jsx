import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../../logo.svg";
import DarkModeToggle from "../DarkModeToggle";
import { AuthContext } from "../../AuthContext";
import { useContext } from "react";
import { jwtDecode } from "jwt-decode";

const NavBar = () => {
  const { isAuthenticated, setIsAuthenticated, isAdmin, username } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      navigate("/");
      return;
    }

    try {
      const csrfResponse = await fetch("/api/get-csrf-token");

      if (!csrfResponse.ok) {
        console.error("Failed to get CSRF token");
        return;
      }

      const csrfData = await csrfResponse.json();

      const decoded = jwtDecode(token);

      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfData.csrf_token,
        },
        body: JSON.stringify({
          jti: decoded.jti,
        }),
      });

      if (!response.ok) {
        console.error("Logout failed");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");

      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img
            src={logo}
            alt={"Logo"}
            width={"45"}
            height={"45"}
            className={"d-inline-block align-top"}
          />
          Knotes
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            {!isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/Login">
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/Register">
                    Register
                  </Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/Notes">
                    Notes
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to={`/Profile/${username}`}>
                    Profile
                  </Link>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-link nav-link"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin/dashboard">
                  Admin Dashboard
                </Link>
              </li>
            )}
            {/*<li className="nav-item">*/}
            {/*  <Link className="nav-link" to="/AboutUs">*/}
            {/*    About Us*/}
            {/*  </Link>*/}
            {/*</li>*/}
            {/*<li className="nav-item">*/}
            {/*  <Link className="nav-link" to="/ContactUs">*/}
            {/*    Contact Us*/}
            {/*  </Link>*/}
            {/*</li>*/}
            <li className="nav-item ms-2">
              <DarkModeToggle />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
