# api/utils/request.py

from flask import jsonify, request


def get_json_body():
    data = request.get_json(silent=True) or {}

    if not data:
        return None, (
            jsonify(error="Missing JSON in request"),
            400,
        )

    return data, None


def require_fields(data, *fields):
    missing = [field for field in fields if not data.get(field)]

    if missing:
        return (
            jsonify(error=f"Missing required fields: {', '.join(missing)}"),
            400,
        )

    return None
