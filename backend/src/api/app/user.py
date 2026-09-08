from flask import Blueprint, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)

from ..decorators.require_json import require_json
from ..extensions import csrf, db
from ..models import RevokedToken, User

user_bp = Blueprint("user", __name__)


@csrf.exempt
@user_bp.post("/auth/me")
@jwt_required()
def validate_token():
    identity = get_jwt_identity()
    claims = get_jwt()
    user = db.session.execute(
        db.select(User).where(User.id == identity)
    ).scalar_one_or_none()
    if user is None:
        return jsonify(isValid=False)

    return jsonify(
        isValid=True,
        user_id=identity,
        role=claims["role"],
        username=user.username,
    )


@user_bp.get("/me")
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = db.session.execute(
        db.select(User).where(User.id == user_id)
    ).scalar_one_or_none()
    return jsonify(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        created_at=user.created_at.isoformat(),
    ), 200


@user_bp.get("/profile/<string:username>")
@jwt_required()
def get_profile(username: str):
    user = db.session.execute(
        db.select(User).where(User.username == username)
    ).scalar_one_or_none()

    if user is None:
        return jsonify(error="User not found"), 404

    return jsonify(
        id=user.id,
        username=user.username,
        email=user.email,
        role=user.role,
        created_at=user.created_at.isoformat(),
    ), 200


@user_bp.post("/register")
@require_json("username", "email", "password")
def register(data: dict):
    username = str(data["username"]).strip().lower()
    email = str(data["email"]).strip().lower()
    password = data["password"]

    user = User().set_register_data(
        username=username,
        email=email,
        password=password,
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(
        message="Registration successful",
        user_id=user.id,
        username=user.username,
    ), 201


@user_bp.post("/logout")
@require_json("jti")
@jwt_required()
def logout(data: dict[str, str]):
    jti: str = data.get("jti")

    revoked_token = RevokedToken(jti=jti)
    db.session.add(revoked_token)
    db.session.commit()

    return jsonify(message="Logged out")


@user_bp.post("/login")
@require_json("email", "password")
def login(data: dict[str, str]):

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify(
            error="Email and password are required",
        ), 400

    user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()

    if user is None or not user.check_password(password):
        return jsonify(
            error="Invalid email or password",
        ), 401

    claims = {"role": user.role}

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims=claims,
    )
    refresh_token = create_refresh_token(
        identity=str(user.id),
        additional_claims=claims,
    )

    return jsonify(
        access_token=access_token,
        refresh_token=refresh_token,
        role=user.role,
    ), 200


@user_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify(access_token=access_token)
