from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.config import get_db
from schemas.user_schemas import UserToCreateSchema, UserResponse
from controllers.user_controller import UserController
from services.user_service import UserService
from repositories import SqlAlchemyUserRepository
from middlewares.auth_middleware import get_current_user_id, require_admin

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

def get_controller(db: Session = Depends(get_db)) -> UserController:
    return UserController(UserService(SqlAlchemyUserRepository(db)))


@router.get("/me", response_model=UserResponse)
def get_user(
    user_id: int = Depends(get_current_user_id),
    controller: UserController = Depends(get_controller),
):
    return controller.get_me(user_id)


@router.put("/me", response_model=UserResponse)
def update_user(
    user_data: UserToCreateSchema,
    user_id: int = Depends(get_current_user_id),
    controller: UserController = Depends(get_controller),
):
    return controller.update_me(user_id, user_data)


@router.delete("/me", status_code=204)
def delete_user(
    user_id: int = Depends(get_current_user_id),
    controller: UserController = Depends(get_controller),
):
    controller.delete_me(user_id)


@router.post("/admin", response_model=UserResponse, status_code=201)
def create_admin(
    user_data: UserToCreateSchema,
    admin_id: int = Depends(require_admin),
    controller: UserController = Depends(get_controller),
):
    return controller.create_admin(user_data)


@router.delete("/{user_id}", status_code=204)
def delete_user_by_admin(
    user_id: int,
    admin_id: int = Depends(require_admin),
    controller: UserController = Depends(get_controller),
):
    controller.delete_user(user_id)
