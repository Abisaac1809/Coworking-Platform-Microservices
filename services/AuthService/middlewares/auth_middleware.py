import jwt
from fastapi import HTTPException, Request
from services.auth_service import SECRET_KEY, ALGORITHM


def get_current_user_id(request: Request) -> int:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format. Must be Bearer <token>")

    token = auth_header.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_admin(request: Request) -> int:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format. Must be Bearer <token>")

    token = auth_header.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role = payload.get("role")
        if role != "Admin":
            raise HTTPException(status_code=403, detail="Access forbidden: Admin role required")
        return int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
