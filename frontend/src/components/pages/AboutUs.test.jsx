import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AboutUs from "./AboutUs";

describe("AboutUs", () => {
  test("renders the about page", () => {
    render(<AboutUs />);

    expect(
      screen.getByRole("heading", { name: "Welcome to Our Website" }),
    ).toBeInTheDocument();
  });
});
