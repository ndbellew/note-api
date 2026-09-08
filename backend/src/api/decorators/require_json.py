from functools import wraps

from flask import jsonify, request


def require_json(*required_fields):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            data = request.get_json(silent=True) or {}

            if not data:
                return jsonify(error="Missing JSON in request"), 400

            missing = [field for field in required_fields if not data.get(field)]

            if missing:
                return jsonify(
                    error=f"Missing required fields: {', '.join(missing)}"
                ), 400

            return func(*args, data=data, **kwargs)

        return wrapper

    return decorator
