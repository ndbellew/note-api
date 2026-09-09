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

const csrfToken = "test-csrf-token";

const expectedHeaders = {
  "Content-Type": "application/json",
  Authorization: "Bearer access-token",
  "X-CSRFToken": csrfToken,
};

const renderNotes = () => {
  render(<Notes csrfToken={csrfToken} />);
};

describe("Notes", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "access-token");
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  test("shows loading state while notes are loading", () => {
    fetchWithTokenRefresh.mockReturnValue(new Promise(() => {}));

    renderNotes();

    expect(screen.getByText("Loading notes...")).toBeInTheDocument();
  });

  test("loads and displays notes", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(notes),
    });

    renderNotes();

    expect(await screen.findByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();

    expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/notes/", {
      headers: expectedHeaders,
    });
  });

  test("handles an empty notes list", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });

    renderNotes();

    expect(await screen.findByText("My Notes")).toBeInTheDocument();

    expect(
      screen.getByText("Select a note to begin editing."),
    ).toBeInTheDocument();

    expect(screen.queryByText("First Note")).not.toBeInTheDocument();
  });

  test("selects the first note after loading", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(notes),
    });

    renderNotes();

    expect(await screen.findByDisplayValue("First Note")).toBeInTheDocument();

    expect(screen.getByDisplayValue("First note content")).toBeInTheDocument();
  });

  test("selects another note from the note list", async () => {
    fetchWithTokenRefresh.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(notes),
    });

    renderNotes();

    const secondNoteButton = await screen.findByRole("button", {
      name: /Second Note/i,
    });

    fireEvent.click(secondNoteButton);

    expect(await screen.findByDisplayValue("Second Note")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Second note content")).toBeInTheDocument();
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

    renderNotes();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /\+ New Note/i,
      }),
    );

    await waitFor(() => {
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/notes/", {
        method: "POST",
        headers: expectedHeaders,
        body: JSON.stringify({
          title: "New Note",
          content: "",
        }),
      });
    });

    expect(await screen.findByDisplayValue("New Note")).toBeInTheDocument();
  });

  test("displays an error when creating a note fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    renderNotes();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /\+ New Note/i,
      }),
    );

    expect(
      await screen.findByText("Unable to create note."),
    ).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();
  });

  test("handles rejected create request", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockRejectedValueOnce(new Error("create exploded"));

    renderNotes();

    fireEvent.click(
      await screen.findByRole("button", {
        name: /\+ New Note/i,
      }),
    );

    expect(
      await screen.findByText("Unable to create note."),
    ).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
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

    renderNotes();

    const titleInput = await screen.findByDisplayValue("First Note");
    const contentInput = screen.getByDisplayValue("First note content");

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
        headers: expectedHeaders,
        body: JSON.stringify({
          title: "Updated Note",
          content: "Updated content",
        }),
      });
    });

    expect(await screen.findByDisplayValue("Updated Note")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Updated content")).toBeInTheDocument();
  });

  test("displays an error when updating a note fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    renderNotes();

    const titleInput = await screen.findByDisplayValue("First Note");

    fireEvent.change(titleInput, {
      target: { value: "Broken Update" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(await screen.findByText("Unable to save note.")).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();
  });

  test("handles rejected update request", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockRejectedValueOnce(new Error("update exploded"));

    renderNotes();

    await screen.findByDisplayValue("First Note");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    expect(await screen.findByText("Unable to save note.")).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
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

    renderNotes();

    expect(await screen.findByText("First Note")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    await waitFor(() => {
      expect(fetchWithTokenRefresh).toHaveBeenCalledWith("/notes/1", {
        method: "DELETE",
        headers: expectedHeaders,
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("First Note")).not.toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Second Note")).toBeInTheDocument();
  });

  test("sets selected note to null after deleting the only note", async () => {
    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue([notes[0]]),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    renderNotes();

    expect(await screen.findByDisplayValue("First Note")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(
      await screen.findByText("Select a note to begin editing."),
    ).toBeInTheDocument();
  });

  test("displays an error when deleting a note fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    renderNotes();

    await screen.findByDisplayValue("First Note");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(
      await screen.findByText("Unable to delete note."),
    ).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();
  });

  test("handles rejected delete request", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(notes),
      })
      .mockRejectedValueOnce(new Error("delete exploded"));

    renderNotes();

    await screen.findByDisplayValue("First Note");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(
      await screen.findByText("Unable to delete note."),
    ).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
  });

  test("displays an error when notes fail to load", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh.mockResolvedValue({
      ok: false,
    });

    renderNotes();

    expect(
      await screen.findByText("Unable to load notes."),
    ).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();
  });

  test("handles rejected notes request", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    fetchWithTokenRefresh.mockRejectedValue(
      new Error("notes request exploded"),
    );

    renderNotes();

    expect(
      await screen.findByText("Unable to load notes."),
    ).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
  });
});
