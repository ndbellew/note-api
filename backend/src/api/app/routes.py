from time import time

from flask import Blueprint, jsonify
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
)
from flask_wtf.csrf import generate_csrf

api_bp = Blueprint("api", __name__)


@api_bp.get("/")
@api_bp.get("/index")
@api_bp.get("/health")
def index():
    return jsonify(status="ok"), 200


@api_bp.get("/time")
def get_current_time():
    return jsonify(time=time()), 200


@api_bp.get("/protected")
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@api_bp.get("/get-csrf-token")
def get_csrf_token():
    token = generate_csrf()
    return jsonify(csrf_token=token), 200
