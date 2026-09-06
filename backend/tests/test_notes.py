from api.extensions import db
from api.models import Note


def test_create_note(client, auth_headers, user):
    response = client.post(
        "/notes/",
        headers=auth_headers,
        json={
            "title": "My note",
            "content": "Hello world",
        },
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["title"] == "My note"
    assert data["content"] == "Hello world"
    assert data["id"] is not None
    assert data["created_at"] is not None
    assert data["updated_at"] is not None

    note = db.session.get(Note, data["id"])

    assert note is not None
    assert note.user_id == user.id


def test_create_note_requires_authentication(client):
    response = client.post(
        "/notes/",
        json={
            "title": "Sneaky note",
            "content": "No token!",
        },
    )

    assert response.status_code == 401


def test_get_notes(client, auth_headers, note):
    response = client.get(
        "/notes/",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.get_json()

    assert len(data) == 1
    assert data[0]["id"] == note.id
    assert data[0]["title"] == "Test note"


def test_get_note(client, auth_headers, note):
    response = client.get(
        f"/notes/{note.id}",
        headers=auth_headers,
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["id"] == note.id
    assert data["title"] == note.title
    assert data["content"] == note.content


def test_get_missing_note_returns_404(client, auth_headers):
    response = client.get(
        "/notes/999999",
        headers=auth_headers,
    )

    assert response.status_code == 404


def test_update_note_title(client, auth_headers, note):
    response = client.patch(
        f"/notes/{note.id}",
        headers=auth_headers,
        json={
            "title": "Updated title",
        },
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["title"] == "Updated title"
    assert data["content"] == "Test content"

    db.session.refresh(note)

    assert note.title == "Updated title"


def test_update_note_content(client, auth_headers, note):
    response = client.patch(
        f"/notes/{note.id}",
        headers=auth_headers,
        json={
            "content": "Updated content",
        },
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["title"] == "Test note"
    assert data["content"] == "Updated content"


def test_create_note_requires_title(client, auth_headers):
    response = client.post(
        "/notes/",
        headers=auth_headers,
        json={
            "content": "No title",
        },
    )

    assert response.status_code == 400


def test_create_note_rejects_long_title(client, auth_headers):
    response = client.post(
        "/notes/",
        headers=auth_headers,
        json={
            "title": "x" * 256,
            "content": "Whatever",
        },
    )

    assert response.status_code == 400


def test_update_note_rejects_empty_title(client, auth_headers, note):
    response = client.patch(
        f"/notes/{note.id}",
        headers=auth_headers,
        json={
            "title": "   ",
        },
    )

    assert response.status_code == 400


def test_delete_note(client, auth_headers, note):
    note_id = note.id

    response = client.delete(
        f"/notes/{note_id}",
        headers=auth_headers,
    )

    assert response.status_code == 204

    deleted_note = db.session.get(Note, note_id)

    assert deleted_note is None


def test_user_cannot_read_another_users_note(
    client,
    auth_headers,
    other_user,
):
    note = Note(
        user_id=other_user.id,
        title="Secret",
        content="You should not see this",
    )

    db.session.add(note)
    db.session.commit()

    response = client.get(
        f"/notes/{note.id}",
        headers=auth_headers,
    )

    assert response.status_code == 404


def test_user_cannot_update_another_users_note(
    client,
    auth_headers,
    other_user,
):
    note = Note(
        user_id=other_user.id,
        title="Secret",
        content="Original",
    )

    db.session.add(note)
    db.session.commit()

    response = client.patch(
        f"/notes/{note.id}",
        headers=auth_headers,
        json={
            "title": "Hacked",
        },
    )

    assert response.status_code == 404

    db.session.refresh(note)

    assert note.title == "Secret"


def test_user_cannot_delete_another_users_note(
    client,
    auth_headers,
    other_user,
):
    note = Note(
        user_id=other_user.id,
        title="Secret",
        content="Original",
    )

    db.session.add(note)
    db.session.commit()

    response = client.delete(
        f"/notes/{note.id}",
        headers=auth_headers,
    )

    assert response.status_code == 404

    assert db.session.get(Note, note.id) is not None


def test_updating_note_changes_updated_at(app, user):
    note = Note(
        user_id=user.id,
        title="Original",
        content="Content",
    )

    db.session.add(note)
    db.session.commit()

    original_updated_at = note.updated_at

    note.title = "Changed"
    db.session.commit()

    assert note.updated_at >= original_updated_at
