from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.config import get_db
from schemas.user_schemas import UserToCreateSchema
from schemas.auth_schemas import AuthResponse, LoginRequest
from controllers.auth_controller import AuthController
from services.auth_service import AuthService
from repositories import SqlAlchemyUserRepository

router = APIRouter(
    prefix="",
    tags=["auth"]
)

def get_controller(db: Session = Depends(get_db)) -> AuthController:
    return AuthController(AuthService(SqlAlchemyUserRepository(db)))


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(
    user_data: UserToCreateSchema,
    controller: AuthController = Depends(get_controller),
):
    return controller.register(user_data)


@router.post("/login", response_model=AuthResponse)
def login(
    credentials: LoginRequest,
    controller: AuthController = Depends(get_controller),
):
    return controller.login(credentials.email, credentials.password)
