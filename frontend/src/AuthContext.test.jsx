import { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { AuthContext, AuthProvider } from "./AuthContext";
import { fetchWithTokenRefresh } from "./utils/utils";

vi.mock("./utils/utils", () => ({
  fetchWithTokenRefresh: vi.fn(),
}));

const Consumer = () => {
  const { isAuthenticated, isAdmin, username } = useContext(AuthContext);

  return (
    <>
      <div data-testid="authenticated">{String(isAuthenticated)}</div>
      <div data-testid="admin">{String(isAdmin)}</div>
      <div data-testid="username">{username}</div>
    </>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("defaults to unauthenticated when no token exists", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("admin")).toHaveTextContent("false");
    expect(screen.getByTestId("username")).toBeEmptyDOMElement();

    expect(fetchWithTokenRefresh).not.toHaveBeenCalled();
  });

  test("sets authenticated user from valid token", async () => {
    localStorage.setItem("token", "access-token");

    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        role: "user",
        username: "nate",
      }),
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("admin")).toHaveTextContent("false");
    expect(screen.getByTestId("username")).toHaveTextContent("nate");
  });

  test("sets admin state for admin user", async () => {
    localStorage.setItem("token", "admin-token");

    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        role: "admin",
        username: "admin",
      }),
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("admin")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("username")).toHaveTextContent("admin");
  });

  test("clears auth state when token validation fails", async () => {
    localStorage.setItem("token", "bad-token");

    fetchWithTokenRefresh.mockResolvedValue({
      ok: false,
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(fetchWithTokenRefresh).toHaveBeenCalled();
    });

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("admin")).toHaveTextContent("false");
    expect(screen.getByTestId("username")).toBeEmptyDOMElement();
  });
});
