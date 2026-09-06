from flask import Flask

from api import models  # noqa: F401
from api.app.routes import api_bp
from api.config import Config
from api.extensions import cors, csrf, db, jwt, migrate
from api.notes.routes import notes_bp


def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    jwt.init_app(app)

    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": app.config["CORS_ORIGINS"],
            }
        },
    )

    app.register_blueprint(api_bp)
    app.register_blueprint(notes_bp)

    return app
