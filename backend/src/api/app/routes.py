from time import time

from flask import Blueprint, jsonify
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)
from flask_wtf.csrf import generate_csrf

api_bp = Blueprint("api", __name__)


# Probably Don't Need
@api_bp.route("/")
@api_bp.route("/index")
def index():
    return "Hello World"


@api_bp.route("/time")
def get_current_time():
    return {"time": time()}


@api_bp.get("/protected")
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user)


@api_bp.get("/get-csrf-token")
def get_csrf_token():
    token = generate_csrf()
    return jsonify(csrf_token=token)
