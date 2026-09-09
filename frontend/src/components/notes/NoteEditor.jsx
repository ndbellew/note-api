import { useState } from "react";
import ReactMarkdown from "react-markdown";

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

      <div className="row g-3">
        <div className="col-md-8">
          <textarea
            className="form-control"
            rows="15"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>

        <div className="col-md-4">
          <div
            className="border rounded p-3"
            style={{
              height: "350px",
              overflowY: "auto",
            }}
          >
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-3">
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
