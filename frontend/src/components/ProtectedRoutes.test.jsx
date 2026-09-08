import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test } from "vitest";

import ProtectedRoutes from "./ProtectedRoutes";

const TestPage = () => <div>Protected Content</div>;

describe("ProtectedRoutes", () => {
  test("redirects unauthenticated user to login", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoutes isAuthenticated={false} element={TestPage} />
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("renders protected component for authenticated user", () => {
    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={<ProtectedRoutes isAuthenticated element={TestPage} />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects non-admin from admin route", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoutes
                isAuthenticated
                isAdmin={false}
                requireAdmin
                element={TestPage}
              />
            }
          />
          <Route path="/unauthorized" element={<div>Unauthorized</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });

  test("allows admin through admin route", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoutes
                isAuthenticated
                isAdmin
                requireAdmin
                element={TestPage}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
