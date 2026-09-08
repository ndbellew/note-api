import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import ContactUs from "./ContactUs";

describe("ContactUs", () => {
  test("renders the contact page", () => {
    render(<ContactUs />);

    expect(
      screen.getByRole("heading", { name: "Welcome to Our Website" }),
    ).toBeInTheDocument();
  });
});
