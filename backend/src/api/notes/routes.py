from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from api.extensions import db
from api.models import Note

notes_bp = Blueprint("notes", __name__, url_prefix="/notes")


@notes_bp.get("/")
@jwt_required()
def get_notes():
    user_id = int(get_jwt_identity())

    notes = (
        db.session.execute(db.select(Note).where(Note.user_id == user_id))
        .scalars()
        .all()
    )

    return jsonify(
        [
            {
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat(),
            }
            for note in notes
        ]
    ), 200


@notes_bp.get("/<int:note_id>")
@jwt_required()
def get_note(note_id: int):
    user_id = int(get_jwt_identity())

    note = db.session.execute(
        db.select(Note).where(
            Note.id == note_id,
            Note.user_id == user_id,
        )
    ).scalar_one_or_none()

    if note is None:
        return jsonify({"error": "Note not found"}), 404

    return jsonify(
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat(),
        }
    ), 200


@notes_bp.post("/")
@jwt_required()
def create_note():
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Missing JSON body"}), 400

    title = str(data.get("title", "")).strip()
    content = str(data.get("content", ""))

    if not title:
        return jsonify({"error": "Title is required"}), 400

    if len(title) > 255:
        return jsonify({"error": "Title must be 255 characters or fewer"}), 400

    user_id = int(get_jwt_identity())

    note = Note(
        title=title,
        content=content,
        user_id=user_id,
    )

    db.session.add(note)
    db.session.commit()

    return jsonify(
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat(),
        }
    ), 201


@notes_bp.delete("/<int:note_id>")
@jwt_required()
def delete_note(note_id: int):
    user_id = int(get_jwt_identity())

    note = db.session.execute(
        db.select(Note).where(
            Note.id == note_id,
            Note.user_id == user_id,
        )
    ).scalar_one_or_none()

    if note is None:
        return jsonify({"error": "Note not found"}), 404

    db.session.delete(note)
    db.session.commit()

    return "", 204


@notes_bp.patch("/<int:note_id>")
@jwt_required()
def update_note(note_id: int):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Missing JSON body"}), 400

    note = db.session.execute(
        db.select(Note).where(
            Note.id == note_id,
            Note.user_id == user_id,
        )
    ).scalar_one_or_none()

    if note is None:
        return jsonify({"error": "Note not found"}), 404

    if not any(field in data for field in ("title", "content")):
        return jsonify({"error": "No valid fields to update"}), 400

    if "title" in data:
        title = str(data["title"]).strip()

        if not title:
            return jsonify({"error": "Title is required"}), 400

        if len(title) > 255:
            return jsonify({"error": "Title must be 255 characters or fewer"}), 400

        note.title = title

    if "content" in data:
        note.content = str(data["content"])

    db.session.commit()

    return jsonify(
        {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "created_at": note.created_at.isoformat(),
            "updated_at": note.updated_at.isoformat(),
        }
    ), 200
