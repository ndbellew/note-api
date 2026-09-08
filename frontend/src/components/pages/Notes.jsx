import { useEffect, useState } from "react";

import NoteEditor from "../notes/NoteEditor";
import NoteList from "../notes/NoteList";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Eventually:
    // fetch notes from GET /notes
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <p>Loading notes...</p>;
  }

  return (
    <div className="row">
      <div className="col-md-4">
        <NoteList
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
        />
      </div>

      <div className="col-md-8">
        <NoteEditor note={selectedNote} />
      </div>
    </div>
  );
}

export default Notes;