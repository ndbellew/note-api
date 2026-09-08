from ..extensions import db, jwt
from ..models.tokens import RevokedToken


@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_payload: dict):
    jti = jwt_payload["jti"]
    token = db.session.execute(
        db.select(RevokedToken).filter_by(jti=jti)
    ).scalar_one_or_none()
    return token is not None
