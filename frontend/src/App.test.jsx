import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import App from "./App.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { fetchWithTokenRefresh } from "./utils/utils";

vi.mock("./utils/utils", () => ({
  fetchWithTokenRefresh: vi.fn(),
}));

const TestAuthProvider = ({
  children,
  initialAuthenticated = false,
  initialAdmin = false,
  username = "",
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [isAdmin, setIsAdmin] = useState(initialAdmin);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isAdmin,
        setIsAdmin,
        username,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchWithTokenRefresh.mockReset();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const renderApp = (
    initialRoute = "/",
    { isAuthenticated = false, isAdmin = false, username = "" } = {},
  ) => {
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <TestAuthProvider
          initialAuthenticated={isAuthenticated}
          initialAdmin={isAdmin}
          username={username}
        >
          <App />
        </TestAuthProvider>
      </MemoryRouter>,
    );
  };

  test("renders navigation", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        csrf_token: "test-csrf-token",
      }),
    });

    renderApp();

    expect(await screen.findByRole("navigation")).toBeInTheDocument();
  });

  test("fetches CSRF token on mount", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        csrf_token: "test-csrf-token",
      }),
    });

    renderApp();

    await waitFor(() => {
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith(
        "/api/get-csrf-token",
        {
          headers: {
            Authorization: "Bearer null",
          },
        },
      );
    });
  });

  test("logs error when CSRF token fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh.mockResolvedValue({
      ok: false,
    });

    renderApp();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch CSRF token");
    });
  });

  test("validates existing token and marks user authenticated", async () => {
    localStorage.setItem("token", "access-token");

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          csrf_token: "csrf-token",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          isValid: true,
          role: "user",
        }),
      });

    renderApp("/Login");

    await waitFor(() => {
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/api/auth/me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer access-token",
        },
      });
    });

    await waitFor(() => {
      expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    });
  });

  test("validates admin token and allows admin dashboard", async () => {
    localStorage.setItem("token", "admin-token");

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          csrf_token: "csrf-token",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          isValid: true,
          role: "admin",
        }),
      });

    renderApp("/admin/dashboard");

    expect(
      await screen.findByRole("heading", {
        name: "Admin Dashboard",
      }),
    ).toBeInTheDocument();
  });

  test("handles token validation error", async () => {
    localStorage.setItem("token", "broken-token");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          csrf_token: "csrf-token",
        }),
      })
      .mockRejectedValueOnce(new Error("validation exploded"));

    renderApp();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Token validation failed:",
        expect.any(Error),
      );
    });
  });

  test("shows login page for unauthenticated user", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        csrf_token: "csrf-token",
      }),
    });

    renderApp("/Login");

    expect(await screen.findByLabelText("Email address")).toBeInTheDocument();
  });

  test("shows register page for unauthenticated user", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        csrf_token: "csrf-token",
      }),
    });

    renderApp("/Register");

    expect(
      await screen.findByRole("heading", {
        name: "Create Account",
      }),
    ).toBeInTheDocument();
  });

  test("redirects unauthenticated profile route to login", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        csrf_token: "csrf-token",
      }),
    });

    renderApp("/Profile/nate");

    expect(await screen.findByLabelText("Email address")).toBeInTheDocument();
  });

  test("redirects unauthenticated admin route to login", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        csrf_token: "csrf-token",
      }),
    });

    renderApp("/admin/dashboard");

    expect(await screen.findByLabelText("Email address")).toBeInTheDocument();
  });
});
