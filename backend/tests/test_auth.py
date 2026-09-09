from api.models import User

LOGIN_URL = "/api/login"


def test_login_returns_tokens(client, user):
    response = client.post(
        LOGIN_URL,
        json={
            "username": user.username,
            "email": user.email,
            "password": "correct-password",
        },
    )

    body = response.get_json()

    assert response.status_code == 200
    assert body["access_token"]
    assert body["refresh_token"]
    assert body["role"] == user.role


def test_login_rejects_incorrect_password(client, user):
    response = client.post(
        LOGIN_URL,
        json={
            "username": user.username,
            "email": user.email,
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert response.get_json() == {
        "error": "Invalid email or password",
    }


def test_login_rejects_unknown_email(client):
    response = client.post(
        LOGIN_URL,
        json={
            "username": "test-username",
            "email": "missing@example.com",
            "password": "correct-password",
        },
    )

    assert response.status_code == 401
    assert response.get_json() == {
        "error": "Invalid email or password",
    }


def test_login_requires_email(client):
    response = client.post(
        LOGIN_URL,
        json={
            "username": "test-username",
            "password": "correct-password",
        },
    )

    assert response.status_code == 400


def test_login_requires_password(client):
    response = client.post(
        LOGIN_URL,
        json={
            "username": "test-username",
            "email": "test@example.com",
        },
    )

    assert response.status_code == 400


def test_login_requires_username(client):
    response = client.post(
        LOGIN_URL,
        json={
            "email": "test@example.com",
            "password": "correct-password",
        },
    )

    assert response.status_code == 401


def test_login_rejects_missing_json_body(client):
    response = client.post(LOGIN_URL)

    assert response.status_code == 400


def test_password_is_stored_as_hash():
    user = User(
        username="hasheduser",
        email="hashed@example.com",
        role="user",
    )

    user.password_hash = user.hash_password("super-secret-password")

    assert user.password_hash != "super-secret-password"
    assert user.check_password("super-secret-password")
    assert not user.check_password("wrong-password")
