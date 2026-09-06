import pytest

from api.app import create_app
from api.config import Config
from api.extensions import db
from api.models import Note, User


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite+pysqlite:///:memory:"
    CORS_ORIGINS = ("http://localhost:5173",)
    WTF_CSRF_ENABLED = False


@pytest.fixture()
def other_user(app):
    user = User(
        email="other@example.com",
        role="user",
    )
    user.set_password("correct-password")

    db.session.add(user)
    db.session.commit()

    return user


@pytest.fixture()
def note(app, user):
    note = Note(
        user_id=user.id,
        title="Test note",
        content="Test content",
    )

    db.session.add(note)
    db.session.commit()

    return note


@pytest.fixture()
def app():
    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()

        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def user(app):
    user = User(
        email="test@example.com",
        role="user",
    )
    user.set_password("correct-password")

    db.session.add(user)
    db.session.commit()

    return user


@pytest.fixture()
def login(client, user):
    response = client.post(
        "/login",
        json={
            "email": user.email,
            "password": "correct-password",
        },
    )

    return response.get_json()


@pytest.fixture()
def auth_headers(login):
    return {
        "Authorization": f"Bearer {login['access_token']}",
    }
