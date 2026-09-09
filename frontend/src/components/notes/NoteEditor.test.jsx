import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import NoteEditor from "./NoteEditor";

const note = {
  id: 1,
  title: "Test Note",
  content: "Original content",
  created_at: "2026-09-08T12:00:00",
  updated_at: "2026-09-08T12:00:00",
};

describe("NoteEditor", () => {
  test("shows placeholder when no note is selected", () => {
    render(<NoteEditor note={null} onSave={vi.fn()} onDelete={vi.fn()} />);

    expect(
      screen.getByText("Select a note to begin editing."),
    ).toBeInTheDocument();
  });

  test("renders the selected note", () => {
    render(<NoteEditor note={note} onSave={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByDisplayValue("Test Note")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Original content")).toBeInTheDocument();
  });

  test("updates title and content fields", () => {
    render(<NoteEditor note={note} onSave={vi.fn()} onDelete={vi.fn()} />);

    const titleInput = screen.getByDisplayValue("Test Note");
    const contentInput = screen.getByDisplayValue("Original content");

    fireEvent.change(titleInput, {
      target: {
        value: "Updated Title",
      },
    });

    fireEvent.change(contentInput, {
      target: {
        value: "Updated content",
      },
    });

    expect(screen.getByDisplayValue("Updated Title")).toBeInTheDocument();

    expect(screen.getByDisplayValue("Updated content")).toBeInTheDocument();
  });

  test("saves edited note", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<NoteEditor note={note} onSave={onSave} onDelete={vi.fn()} />);

    fireEvent.change(screen.getByDisplayValue("Test Note"), {
      target: {
        value: "Updated Title",
      },
    });

    fireEvent.change(screen.getByDisplayValue("Original content"), {
      target: {
        value: "Updated content",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Save",
      }),
    );

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...note,
        title: "Updated Title",
        content: "Updated content",
      });
    });
  });

  test("deletes the selected note", () => {
    const onDelete = vi.fn();

    render(<NoteEditor note={note} onSave={vi.fn()} onDelete={onDelete} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete",
      }),
    );

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test("renders markdown preview", () => {
    const markdownNote = {
      ...note,
      content: "# Heading",
    };

    render(
      <NoteEditor note={markdownNote} onSave={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Heading",
      }),
    ).toBeInTheDocument();
  });
});
