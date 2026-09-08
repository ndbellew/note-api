function NoteListItem({ note, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={`list-group-item list-group-item-action ${
        isSelected ? "active" : ""
      }`}
      onClick={onClick}
    >
      <strong>{note.title}</strong>

      <div>
        <small>{note.updated_at}</small>
      </div>
    </button>
  );
}

export default NoteListItem;
