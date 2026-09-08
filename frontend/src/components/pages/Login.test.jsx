import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Login from "./Login";

describe("Login", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("alert", vi.fn());
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const renderLogin = () => {
    render(
      <MemoryRouter initialEntries={["/Login"]}>
        <Routes>
          <Route path="/Login" element={<Login csrfToken="csrf-token" />} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/admin/dashboard" element={<div>Admin Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  const fillLogin = () => {
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "nate@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
  };

  test("logs in normal user and stores tokens", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: "access-token",
        refresh_token: "refresh-token",
        role: "user",
      }),
    });

    renderLogin();
    fillLogin();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Home Page")).toBeInTheDocument();

    expect(localStorage.getItem("token")).toBe("access-token");
    expect(localStorage.getItem("refresh_token")).toBe("refresh-token");

    expect(fetch).toHaveBeenCalledWith("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": "csrf-token",
      },
      body: JSON.stringify({
        email: "nate@example.com",
        password: "password123",
      }),
    });
  });

  test("navigates admin to admin dashboard", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: "admin-token",
        refresh_token: "refresh-token",
        role: "admin",
      }),
    });

    renderLogin();
    fillLogin();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Admin Page")).toBeInTheDocument();
  });

  test("displays login error from backend", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: "Invalid email or password",
      }),
    });

    renderLogin();
    fillLogin();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
  });

  test("handles invalid JSON response", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error("bad json")),
    });

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderLogin();
    fillLogin();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Login failed!")).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();
  });
});
