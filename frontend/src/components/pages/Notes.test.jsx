import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Notes from "./Notes";
import { fetchWithTokenRefresh } from "../../utils/utils";

vi.mock("../../utils/utils", () => ({
  fetchWithTokenRefresh: vi.fn(),
}));

const notes = [
  {
    id: 1,
    title: "First Note",
    content: "First note content",
    created_at: "2026-09-08T12:00:00",
    updated_at: "2026-09-08T12:00:00",
  },
  {
    id: 2,
    title: "Second Note",
    content: "Second note content",
    created_at: "2026-09-08T13:00:00",
    updated_at: "2026-09-08T13:00:00",
  },
];

describe("Notes", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "access-token");
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test("shows loading state while notes are loading", () => {
    fetchWithTokenRefresh.mockReturnValue(new Promise(() => {}));

    render(<Notes />);

    expect(screen.getByText("Loading notes...")).toBeInTheDocument();
  });

  test("loads and displays notes", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(notes),
    });

    render(<Notes />);

    expect(await screen.findByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();

    expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/notes/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer access-token",
      },
    });
  });

  test("selects the first note after loading", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(notes),
    });

    render(<Notes />);

    expect(
      await screen.findByDisplayValue("First Note"),
    ).toBeInTheDocument();

    expect(
      await screen.findByDisplayValue("First note content"),
    ).toBeInTheDocument();
  });

  test("selects another note from the note list", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(notes),
    });

    render(<Notes />);

    const secondNoteButton = await screen.findByRole("button", {
      name: /Second Note/i,
    });

    fireEvent.click(secondNoteButton);

    expect(
      await screen.findByDisplayValue("Second Note"),
    ).toBeInTheDocument();

    expect(
      await screen.findByDisplayValue("Second note content"),
    ).toBeInTheDocument();
  });

  test("creates a new note", async () => {
    const newNote = {
      id: 3,
      title: "New Note",
      content: "",
      created_at: "2026-09-08T14:00:00",
      updated_at: "2026-09-08T14:00:00",
    };

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(newNote),
      });

    render(<Notes />);

    const newNoteButton = await screen.findByRole("button", {
      name: /\+ New Note/i,
    });

    fireEvent.click(newNoteButton);

    await waitFor(() => {
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/notes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer access-token",
        },
        body: JSON.stringify({
          title: "New Note",
          content: "",
        }),
      });
    });

    expect(
      await screen.findByDisplayValue("New Note"),
    ).toBeInTheDocument();
  });

  test("updates a note", async () => {
    const updatedNote = {
      ...notes[0],
      title: "Updated Note",
      content: "Updated content",
      updated_at: "2026-09-08T15:00:00",
    };

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(updatedNote),
      });

    render(<Notes />);

    const titleInput = await screen.findByDisplayValue("First Note");
    const contentInput = await screen.findByDisplayValue("First note content");

    fireEvent.change(titleInput, {
      target: { value: "Updated Note" },
    });

    fireEvent.change(contentInput, {
      target: { value: "Updated content" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/notes/1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer access-token",
        },
        body: JSON.stringify({
          title: "Updated Note",
          content: "Updated content",
        }),
      });
    });

    expect(
      await screen.findByDisplayValue("Updated Note"),
    ).toBeInTheDocument();

    expect(
      await screen.findByDisplayValue("Updated content"),
    ).toBeInTheDocument();
  });

  test("deletes a note", async () => {
    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<Notes />);

    expect(await screen.findByText("First Note")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    await waitFor(() => {
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/notes/1", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer access-token",
        },
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("First Note")).not.toBeInTheDocument();
    });

    expect(
      await screen.findByDisplayValue("Second Note"),
    ).toBeInTheDocument();

    expect(
      await screen.findByDisplayValue("Second note content"),
    ).toBeInTheDocument();
  });

  test("displays an error when notes fail to load", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: false,
    });

    render(<Notes />);

    expect(
      await screen.findByText("Unable to load notes."),
    ).toBeInTheDocument();
  });
});