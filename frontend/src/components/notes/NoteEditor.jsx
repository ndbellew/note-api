import { useState } from "react";

function NoteEditor({ note, onSave, onDelete }) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");

  if (!note) {
    return <div className="text-muted">Select a note to begin editing.</div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSave({
      ...note,
      title,
      content,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        className="form-control mb-3"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={255}
        required
      />

      <textarea
        className="form-control mb-3"
        rows="15"
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />

      <div className="d-flex justify-content-between">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onDelete(note.id)}
        >
          Delete
        </button>

        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}

export default NoteEditor;
