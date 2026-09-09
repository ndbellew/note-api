import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";

import ProtectedRoutes from "./ProtectedRoutes";

const ProtectedContent = () => <div>Protected Content</div>;

const renderProtectedRoute = ({
  isAuthenticated = false,
  isAdmin = false,
  requireAdmin = false,
} = {}) => {
  render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoutes
              element={ProtectedContent}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              requireAdmin={requireAdmin}
            />
          }
        />

        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ProtectedRoutes", () => {
  test("redirects unauthenticated user to login", async () => {
    renderProtectedRoute();

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  test("renders protected component for authenticated user", async () => {
    renderProtectedRoute({
      isAuthenticated: true,
    });

    expect(await screen.findByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects non-admin from admin route", async () => {
    renderProtectedRoute({
      isAuthenticated: true,
      isAdmin: false,
      requireAdmin: true,
    });

    expect(await screen.findByText("Unauthorized")).toBeInTheDocument();
  });

  test("allows admin through admin route", async () => {
    renderProtectedRoute({
      isAuthenticated: true,
      isAdmin: true,
      requireAdmin: true,
    });

    expect(await screen.findByText("Protected Content")).toBeInTheDocument();
  });
});
