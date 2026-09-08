import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AdminDashboard from "./AdminDashboard";

describe("AdminDashboard", () => {
  test("renders admin dashboard sections", () => {
    render(<AdminDashboard />);

    expect(
      screen.getByRole("heading", { name: "Admin Dashboard" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Manage Users")).toBeInTheDocument();
    expect(screen.getByText("Manage Companies")).toBeInTheDocument();
    expect(screen.getByText("View Reports")).toBeInTheDocument();
  });
});
