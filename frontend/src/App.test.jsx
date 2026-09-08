import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import App from "./App.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { fetchWithTokenRefresh } from "./utils/utils";

vi.mock("./utils/utils", () => ({
  fetchWithTokenRefresh: vi.fn(),
}));

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();

    vi.stubGlobal("fetch", vi.fn());

    fetchWithTokenRefresh.mockReset();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const renderApp = (
    initialRoute = "/",
    authValue = {
      isAuthenticated: false,
      isAdmin: false,
      username: "",
    },
  ) => {
    render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthContext.Provider value={authValue}>
          <App />
        </AuthContext.Provider>
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

    expect(screen.getByRole("navigation")).toBeInTheDocument();
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
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/get-csrf-token", {
        headers: {
          Authorization: "Bearer null",
        },
      });
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
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/auth/me", {
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

  test("fetches and displays server time", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        csrf_token: "csrf-token",
      }),
    });

    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        time: "2026-09-08T09:45:00",
      }),
    });

    renderApp();

    const button = screen.getByRole("button", {
      name: "Time since Epoch!",
    });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    fireEvent.click(button);

    expect(
      await screen.findByRole("button", {
        name: "2026-09-08T09:45:00",
      }),
    ).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith("/time", {
      headers: {
        "X-CSRFToken": "csrf-token",
      },
    });
  });

  test("logs error when server time fetch fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        csrf_token: "csrf-token",
      }),
    });

    fetch.mockResolvedValue({
      ok: false,
    });

    renderApp();

    const button = screen.getByRole("button", {
      name: "Time since Epoch!",
    });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch server time");
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
