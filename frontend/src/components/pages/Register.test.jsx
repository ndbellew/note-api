import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Register from "./Register";

describe("Register", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const renderRegister = () => {
    render(
      <MemoryRouter initialEntries={["/Register"]}>
        <Routes>
          <Route
            path="/Register"
            element={<Register csrfToken="test-csrf" />}
          />
          <Route path="/Login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );
  };

  const fillForm = ({
    username = "nate",
    email = "nate@example.com",
    password = "password123",
    confirmPassword = "password123",
  } = {}) => {
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: username },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
    });

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: password },
    });

    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: confirmPassword },
    });
  };

  test("renders registration form", () => {
    renderRegister();

    expect(
      screen.getByRole("heading", { name: "Create Account" }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  test("rejects mismatched passwords without calling backend", () => {
    renderRegister();

    fillForm({
      password: "password123",
      confirmPassword: "different",
    });

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();

    expect(fetch).not.toHaveBeenCalled();
  });

  test("registers user and navigates to login", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        message: "Registration successful",
      }),
    });

    renderRegister();
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": "test-csrf",
        },
        body: JSON.stringify({
          username: "nate",
          email: "nate@example.com",
          password: "password123",
        }),
      });
    });

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  test("displays backend registration error", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({
        error: "Username already exists",
      }),
    });

    renderRegister();
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(
      await screen.findByText("Username already exists"),
    ).toBeInTheDocument();
  });

  test("uses fallback error when backend provides none", async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });

    renderRegister();
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    expect(await screen.findByText("Registration failed.")).toBeInTheDocument();
  });
});
