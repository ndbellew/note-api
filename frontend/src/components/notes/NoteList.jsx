import NoteListItem from "./NoteListItem";

function NoteList({ notes, selectedNote, onSelectNote }) {
  return (
    <div>
      <h2>Notes</h2>

      <div
        style={{
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {notes.map((note) => (
          <NoteListItem
            key={note.id}
            note={note}
            isSelected={selectedNote?.id === note.id}
            onClick={() => onSelectNote(note)}
          />
        ))}
      </div>
    </div>
  );
}

export default NoteList;