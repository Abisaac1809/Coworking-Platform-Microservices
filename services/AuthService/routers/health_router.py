from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from database.config import get_db

router = APIRouter(
    prefix="",
    tags=["health"]
)


@router.get("/health")
def health(db: Session = Depends(get_db)):
    database_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        database_status = "disconnected"

    return {
        "status": "healthy",
        "service": "AuthService",
        "database": database_status,
    }
