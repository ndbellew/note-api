import { useEffect, useState } from "react";

import NoteEditor from "../notes/NoteEditor";
import NoteList from "../notes/NoteList";
import { fetchWithTokenRefresh } from "../../utils/utils";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetchWithTokenRefresh("/notes/", {
          headers: authHeaders(),
        });

        if (!response?.ok) {
          throw new Error("Failed to load notes");
        }

        const data = await response.json();

        setNotes(data);

        if (data.length > 0) {
          setSelectedNote(data[0]);
        }
      } catch (error) {
        console.error(error);
        setError("Unable to load notes.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchNotes();
  }, []);

  const createNote = async () => {
    try {
      const response = await fetchWithTokenRefresh("/notes/", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: "New Note",
          content: "",
        }),
      });

      if (!response?.ok) {
        throw new Error("Failed to create note");
      }

      const newNote = await response.json();

      setNotes((currentNotes) => [newNote, ...currentNotes]);

      setSelectedNote(newNote);
    } catch (error) {
      console.error(error);
      setError("Unable to create note.");
    }
  };

  const saveNote = async (note) => {
    try {
      const response = await fetchWithTokenRefresh(`/notes/${note.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          title: note.title,
          content: note.content,
        }),
      });

      if (!response?.ok) {
        throw new Error("Failed to update note");
      }

      const updatedNote = await response.json();

      setNotes((currentNotes) =>
        currentNotes.map((currentNote) =>
          currentNote.id === updatedNote.id ? updatedNote : currentNote,
        ),
      );

      setSelectedNote(updatedNote);
    } catch (error) {
      console.error(error);
      setError("Unable to save note.");
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await fetchWithTokenRefresh(`/notes/${noteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!response?.ok) {
        throw new Error("Failed to delete note");
      }

      const remainingNotes = notes.filter((note) => note.id !== noteId);

      setNotes(remainingNotes);
      setSelectedNote(remainingNotes[0] ?? null);
    } catch (error) {
      console.error(error);
      setError("Unable to delete note.");
    }
  };

  if (isLoading) {
    return <p>Loading notes...</p>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Notes</h1>

        <button className="btn btn-primary" onClick={createNote}>
          + New Note
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-4">
          <NoteList
            notes={notes}
            selectedNote={selectedNote}
            onSelectNote={setSelectedNote}
          />
        </div>

        <div className="col-md-8">
          <NoteEditor
            note={selectedNote}
            onSave={saveNote}
            onDelete={deleteNote}
          />
        </div>
      </div>
    </div>
  );
}

export default Notes;
