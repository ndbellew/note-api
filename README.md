# Note Taking API

A containerized note-taking application that provides authenticated CRUD operations for user-owned notes.

The project is designed to be easy to run locally with Docker Compose and includes a Flask API, PostgreSQL database, Vite frontend, automated tests, and CI quality/security checks.

## What Does It Do?

The API allows authenticated users to:

* create notes
* retrieve all of their notes
* retrieve an individual note
* update note content or title
* delete notes

Each note is owned by a specific user, and all note queries are scoped to the authenticated user's JWT identity.

Users cannot read, modify, or delete notes owned by another user.

The current implementation includes authentication and token refresh support, but does not yet expose a public user registration endpoint.

---

# Running the Application

## Requirements

You only need:

* Docker
* Docker Compose

## Environment Files

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

The backend environment contains values such as:

```env
FLASK_DEBUG=false
DATABASE_URL=postgresql+psycopg://app:password@database:5432/app
JWT_SECRET_KEY=generate-a-secure-random-value
```

Use a secure random value for `JWT_SECRET_KEY`.

PostgreSQL configuration is stored in:

```text
config/database.env
```

## Start the Application

From the repository root:

```bash
docker compose up --build
```

Docker Compose starts:

| Service       | Address               |
| ------------- | --------------------- |
| Vite frontend | http://localhost:5173 |
| Flask API     | http://localhost:5000 |
| PostgreSQL    | localhost:5432        |

The application runs entirely within containers, so a local Python, PostgreSQL, or Node installation is not required for normal application startup.

To stop the environment:

```bash
docker compose down
```

To also remove the PostgreSQL data volume:

```bash
docker compose down -v
```

## Database Migrations

The backend uses Flask-Migrate/Alembic.

Apply existing migrations after startup with:

```bash
docker compose exec backend uv run flask --app api.api db upgrade
```

To create a new migration:

```bash
docker compose exec backend uv run flask --app api.api db migrate -m "describe migration"
```

Then apply it:

```bash
docker compose exec backend uv run flask --app api.api db upgrade
```

---

# Tech Stack

## Containers

* Docker
* Docker Compose

## Backend

* Python
* Flask
* Flask-SQLAlchemy
* SQLAlchemy 2.x
* PostgreSQL
* Flask-JWT-Extended
* Flask-Migrate / Alembic
* uv

## Frontend

* Vite
* React
* Bootstrap

Vite is used as the frontend development/build environment, with React providing the UI component layer.

## Testing and Quality

* pytest
* Ruff
* mypy
* Bandit
* pip-audit

---

# API Reference

All note routes require an authenticated JWT access token.

Requests to protected routes should include:

```http
Authorization: Bearer <access_token>
```

The examples below assume the backend is available at:

```text
http://localhost:5000
```

---

## Authentication

### Login

```http
POST /login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Successful response:

```json
{
  "access_token": "<jwt-access-token>",
  "refresh_token": "<jwt-refresh-token>",
  "role": "user"
}
```

Response:

```text
200 OK
```

Invalid credentials return:

```text
401 Unauthorized
```

### Refresh Access Token

```http
POST /refresh
```

Send the refresh token:

```http
Authorization: Bearer <refresh_token>
```

Response:

```json
{
  "access_token": "<new-access-token>"
}
```

### Authenticated User

```http
POST /auth/me
```

Requires an access token.

Example response:

```json
{
  "isValid": true,
  "user_id": "1",
  "role": "user"
}
```

---

# Notes API

## Note Object

A note is represented as:

```json
{
  "id": 1,
  "title": "Project ideas",
  "content": "Build a note-taking API.",
  "created_at": "2026-09-06T20:00:00+00:00",
  "updated_at": "2026-09-06T20:00:00+00:00"
}
```

| Field        | Type     | Description                            |
| ------------ | -------- | -------------------------------------- |
| `id`         | integer  | Unique note identifier                 |
| `title`      | string   | Required title, maximum 255 characters |
| `content`    | string   | Note body                              |
| `created_at` | datetime | Time the note was created              |
| `updated_at` | datetime | Time the note was last modified        |

---

## Get All Notes

```http
GET /notes/
```

Returns all notes owned by the authenticated user.

Example:

```bash
curl http://localhost:5000/notes/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Response:

```json
[
  {
    "id": 1,
    "title": "Project ideas",
    "content": "Build a note-taking API.",
    "created_at": "2026-09-06T20:00:00+00:00",
    "updated_at": "2026-09-06T20:00:00+00:00"
  }
]
```

Response:

```text
200 OK
```

---

## Get One Note

```http
GET /notes/<note_id>
```

Example:

```bash
curl http://localhost:5000/notes/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Successful response:

```text
200 OK
```

If the note does not exist or does not belong to the authenticated user:

```text
404 Not Found
```

```json
{
  "error": "Note not found"
}
```

---

## Create a Note

```http
POST /notes/
```

Request:

```json
{
  "title": "Project ideas",
  "content": "Build a note-taking API."
}
```

Example:

```bash
curl -X POST http://localhost:5000/notes/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project ideas",
    "content": "Build a note-taking API."
  }'
```

Successful response:

```text
201 Created
```

```json
{
  "id": 1,
  "title": "Project ideas",
  "content": "Build a note-taking API.",
  "created_at": "2026-09-06T20:00:00+00:00",
  "updated_at": "2026-09-06T20:00:00+00:00"
}
```

A title is required and must not exceed 255 characters.

Invalid input returns:

```text
400 Bad Request
```

---

## Update a Note

```http
PATCH /notes/<note_id>
```

The endpoint supports partial updates.

Update only the title:

```json
{
  "title": "Updated title"
}
```

Update only the content:

```json
{
  "content": "Updated note content."
}
```

Update both:

```json
{
  "title": "Updated title",
  "content": "Updated note content."
}
```

Example:

```bash
curl -X PATCH http://localhost:5000/notes/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title"
  }'
```

Successful response:

```text
200 OK
```

Invalid input returns:

```text
400 Bad Request
```

A note that does not exist or does not belong to the authenticated user returns:

```text
404 Not Found
```

---

## Delete a Note

```http
DELETE /notes/<note_id>
```

Example:

```bash
curl -X DELETE http://localhost:5000/notes/1 \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Successful response:

```text
204 No Content
```

A note that does not exist or does not belong to the authenticated user returns:

```text
404 Not Found
```

---

# API Summary

| Method   | Endpoint      | Authentication | Description                             |
| -------- | ------------- | -------------- | --------------------------------------- |
| `POST`   | `/login`      | No             | Authenticate a user                     |
| `POST`   | `/refresh`    | Refresh JWT    | Generate a new access token             |
| `POST`   | `/auth/me`    | Access JWT     | Retrieve authenticated user information |
| `GET`    | `/notes/`     | Access JWT     | Retrieve all notes owned by the user    |
| `GET`    | `/notes/<id>` | Access JWT     | Retrieve one note                       |
| `POST`   | `/notes/`     | Access JWT     | Create a note                           |
| `PATCH`  | `/notes/<id>` | Access JWT     | Partially update a note                 |
| `DELETE` | `/notes/<id>` | Access JWT     | Delete a note                           |

---

# API Design Notes

## Note Ownership

The user ID is never accepted from the client when accessing notes.

Instead, ownership is derived from the authenticated JWT:

```python
user_id = int(get_jwt_identity())
```

Database queries are scoped to both the requested note and the authenticated user:

```python
db.select(Note).where(
    Note.id == note_id,
    Note.user_id == user_id,
)
```

This prevents users from accessing notes belonging to another account.

## Resource Enumeration

Requests for a note belonging to another user return:

```text
404 Not Found
```

rather than exposing whether the resource exists.

This avoids leaking information about resources owned by other users.

## Partial Updates

Updates use:

```http
PATCH
```

rather than `PUT`.

This allows clients to update the title or content independently without resending the entire note.

## Content Storage

Note content is stored as application data rather than being transformed by the backend for presentation.

Formatting and rendering decisions can therefore remain with the frontend.

---

# Security

## JWT Authentication

The API uses JWT-based authentication through Flask-JWT-Extended.

Two token types are issued:

* access tokens for authenticated API requests
* refresh tokens for obtaining new access tokens

The JWT identity contains the authenticated user's database ID.

Authorization decisions are made server-side using that identity rather than trusting user identifiers supplied by clients.

## Password Handling

User passwords are stored as password hashes rather than plaintext values.

## Authorization

Authentication and authorization are handled separately:

* JWT validation determines who the user is
* database ownership checks determine which resources that user may access

All note CRUD routes enforce both.

## Dependency Auditing

Known dependency vulnerabilities are checked using:

```bash
uv run pip-audit
```

## Static Application Security Testing

Python source code is scanned using Bandit:

```bash
uv run bandit -r src
```

---

# Testing

The backend test suite uses pytest.

From the `backend` directory:

```bash
uv run pytest
```

The test suite covers:

* authentication
* note creation
* note retrieval
* partial updates
* deletion
* model behavior
* input validation
* JWT-protected endpoints
* cross-user authorization

Authorization tests specifically verify that one user cannot:

* read another user's note
* modify another user's note
* delete another user's note

---

# CI and Quality Checks

GitHub Actions runs automated checks against the backend.

## Tests

```bash
uv run pytest
```

## Ruff Linting

```bash
uv run ruff check .
```

## Ruff Formatting

```bash
uv run ruff format --check .
```

## Type Checking

```bash
uv run mypy src
```

## SAST

```bash
uv run bandit -r src
```

## Dependency Vulnerability Scan

```bash
uv run pip-audit
```

These checks provide automated coverage for:

* application behavior
* formatting
* linting
* type correctness
* common Python security issues
* known vulnerable dependencies

---

# Current Scope

Implemented:

* containerized application environment
* Flask REST API
* PostgreSQL persistence
* Vite frontend
* JWT login
* JWT refresh
* authenticated note CRUD
* user-scoped note ownership
* database migrations
* backend integration tests
* CI quality checks
* SAST scanning
* dependency vulnerability auditing

Not currently implemented:

* public user registration
* team membership
* shared notes
* pagination
* tags
* folders
* search

These features are outside the current baseline and can be added as the application grows.

## License

See `LICENSE` for licensing information.
