from schemas.user_schemas import UserToCreateSchema, UserInDb, UserResponse
from protocols import PUserRepository
from errors.business_errors import UserNotFoundError, UserEmailAlreadyExistsError, UserPhoneAlreadyExistsError
from pwdlib import PasswordHash

_pwd_hash = PasswordHash.recommended()


class UserService:
    __user_repository: PUserRepository

    def __init__(self, user_repository: PUserRepository):
        self.__user_repository = user_repository

    def __get_user_or_raise(self, user_id: int) -> UserInDb:
        user = self.__user_repository.get_user_by_id(user_id)

        if not user:
            raise UserNotFoundError(user_id)

        return user

    def __ensure_email_is_available(self, email: str) -> None:
        if self.__user_repository.get_user_by_email(email):
            raise UserEmailAlreadyExistsError(email)

    def __ensure_phone_is_available(self, phone: str) -> None:
        if self.__user_repository.get_user_by_phone(phone):
            raise UserPhoneAlreadyExistsError(phone)

    def __to_public(self, user_in_db: UserInDb) -> UserResponse:
        return UserResponse(**user_in_db.model_dump(exclude={"password"}))

    def get_user_by_id(self, user_id: int) -> UserResponse:
        return self.__to_public(self.__get_user_or_raise(user_id))

    def create_user(self, user_data: UserToCreateSchema) -> UserResponse:
        self.__ensure_email_is_available(user_data.email)
        self.__ensure_phone_is_available(user_data.phone)
        return self.__to_public(self.__user_repository.create_user(user_data))

    def update_user(self, user_id: int, user_data: UserToCreateSchema) -> UserResponse:
        user = self.__get_user_or_raise(user_id)

        if user.email != user_data.email:
            self.__ensure_email_is_available(user_data.email)
        if user.phone != user_data.phone:
            self.__ensure_phone_is_available(user_data.phone)

        return self.__to_public(self.__user_repository.update_user(user_id, user_data))

    def delete_user(self, user_id: int) -> None:
        self.__get_user_or_raise(user_id)
        self.__user_repository.delete_user(user_id)

    def create_admin(self, user_data: UserToCreateSchema) -> UserResponse:
        self.__ensure_email_is_available(user_data.email)
        self.__ensure_phone_is_available(user_data.phone)
        
        hashed = _pwd_hash.hash(user_data.password)
        user_to_store = user_data.model_copy(update={"password": hashed, "role": "Admin"})
        return self.__to_public(self.__user_repository.create_user(user_to_store))
