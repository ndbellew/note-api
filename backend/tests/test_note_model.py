from api.extensions import db
from api.models import Note


def test_note_creation(app, user):
    note = Note(
        user_id=user.id,
        title="Test note",
        content="Hello",
    )

    db.session.add(note)
    db.session.commit()

    assert note.id is not None
    assert note.user_id == user.id
    assert note.title == "Test note"
    assert note.content == "Hello"
    assert note.created_at is not None
    assert note.updated_at is not None
