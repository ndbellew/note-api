import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { AuthContext } from "../../AuthContext";
import NavBar from "./NavBar";

const renderNavBar = (authValue) => {
  render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <NavBar />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
};

describe("NavBar", () => {
  test("shows login and register for unauthenticated users", () => {
    renderNavBar({
      isAuthenticated: false,
      isAdmin: false,
      username: "",
    });

    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Profile" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Admin Dashboard" }),
    ).not.toBeInTheDocument();
  });

  test("shows profile for authenticated user", () => {
    renderNavBar({
      isAuthenticated: true,
      isAdmin: false,
      username: "nate",
    });

    const profileLink = screen.getByRole("link", { name: "Profile" });

    expect(profileLink).toHaveAttribute("href", "/Profile/nate");

    expect(
      screen.queryByRole("link", { name: "Login" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "Register" }),
    ).not.toBeInTheDocument();
  });

  test("shows admin dashboard for authenticated admin", () => {
    renderNavBar({
      isAuthenticated: true,
      isAdmin: true,
      username: "admin",
    });

    expect(
      screen.getByRole("link", { name: "Admin Dashboard" }),
    ).toHaveAttribute("href", "/admin/dashboard");
  });
});
