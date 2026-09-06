from datetime import UTC, datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from werkzeug.security import check_password_hash, generate_password_hash

from api.extensions import db


class User(db.Model):  # type: ignore[name-defined]
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)

    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="user",
    )
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    notes = db.relationship(
        "Note", backref="user", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)
