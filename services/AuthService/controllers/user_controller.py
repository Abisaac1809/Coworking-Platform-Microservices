from schemas.user_schemas import UserToCreateSchema, UserResponse 
from services.user_service import UserService


class UserController:
    __user_service: UserService

    def __init__(self, user_service: UserService):
        self.__user_service = user_service

    def get_me(self, user_id: int) -> UserResponse:
        return self.__user_service.get_user_by_id(user_id)

    def update_me(self, user_id: int, user_data: UserToCreateSchema) -> UserResponse:
        return self.__user_service.update_user(user_id, user_data)

    def delete_me(self, user_id: int) -> None:
        self.__user_service.delete_user(user_id)

    def create_admin(self, user_data: UserToCreateSchema) -> UserResponse:
        return self.__user_service.create_admin(user_data)

    def delete_user(self, user_id: int) -> None:
        self.__user_service.delete_user(user_id)
