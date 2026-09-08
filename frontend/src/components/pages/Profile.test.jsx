import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Profile from "./Profile";
import { fetchWithTokenRefresh } from "../../utils/utils";

vi.mock("../../utils/utils", () => ({
  fetchWithTokenRefresh: vi.fn(),
}));

describe("Profile", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "access-token");
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderProfile = () => {
    render(
      <MemoryRouter initialEntries={["/Profile/nate"]}>
        <Routes>
          <Route path="/Profile/:username" element={<Profile />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  test("shows loading state", () => {
    fetchWithTokenRefresh.mockReturnValue(new Promise(() => {}));

    renderProfile();

    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
  });

  test("loads and displays profile", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: 1,
        username: "nate",
        email: "nate@example.com",
        role: "user",
        created_at: "2026-09-08T12:00:00",
      }),
    });

    renderProfile();

    expect(
      await screen.findByRole("heading", { name: "nate" }),
    ).toBeInTheDocument();

    expect(screen.getByText("nate@example.com")).toBeInTheDocument();
    expect(screen.getByText("user")).toBeInTheDocument();

    expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/profile/nate", {
      method: "GET",
      headers: {
        Authorization: "Bearer access-token",
      },
    });
  });

  test("displays backend profile error", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: "User not found",
      }),
    });

    renderProfile();

    expect(await screen.findByText("User not found")).toBeInTheDocument();
  });

  test("uses fallback profile error", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });

    renderProfile();

    expect(
      await screen.findByText("Failed to load profile."),
    ).toBeInTheDocument();
  });
});
