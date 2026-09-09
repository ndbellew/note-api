import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import NoteList from "./NoteList";

const notes = [
  {
    id: 1,
    title: "First Note",
    content: "First content",
    updated_at: "2026-09-08T12:00:00",
  },
  {
    id: 2,
    title: "Second Note",
    content: "Second content",
    updated_at: "2026-09-08T13:00:00",
  },
];

describe("NoteList", () => {
  test("renders all notes", () => {
    render(
      <NoteList notes={notes} selectedNote={null} onSelectNote={vi.fn()} />,
    );

    expect(screen.getByText("First Note")).toBeInTheDocument();
    expect(screen.getByText("Second Note")).toBeInTheDocument();
  });

  test("calls onSelectNote when a note is clicked", () => {
    const onSelectNote = vi.fn();

    render(
      <NoteList
        notes={notes}
        selectedNote={null}
        onSelectNote={onSelectNote}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Second Note/i,
      }),
    );

    expect(onSelectNote).toHaveBeenCalledWith(notes[1]);
  });

  test("marks the selected note", () => {
    render(
      <NoteList notes={notes} selectedNote={notes[0]} onSelectNote={vi.fn()} />,
    );

    const selectedButton = screen.getByRole("button", {
      name: /First Note/i,
    });

    expect(selectedButton).toHaveClass("active");
  });

  test("handles an empty notes list", () => {
    render(<NoteList notes={[]} selectedNote={null} onSelectNote={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /note/i,
      }),
    ).not.toBeInTheDocument();
  });
});
