import os
import jwt
from datetime import datetime, timedelta, timezone
from pwdlib import PasswordHash
from schemas.user_schemas import UserToCreateSchema, UserInDb, UserResponse
from protocols import PUserRepository
from errors.business_errors import (
    InvalidCredentialsError,
    UserEmailAlreadyExistsError,
    UserPhoneAlreadyExistsError,
)

SECRET_KEY = os.getenv("SECRET_KEY", "clave-ultra-secreta")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

_pwd_hash = PasswordHash.recommended()

class AuthService:
    __user_repository: PUserRepository

    def __init__(self, user_repository: PUserRepository):
        self.__user_repository = user_repository

    def __hash_password(self, plain_password: str) -> str:
        return _pwd_hash.hash(plain_password)

    def __verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return _pwd_hash.verify(plain_password, hashed_password)

    def __to_public(self, user_in_db: UserInDb) -> UserResponse:
        return UserResponse(**user_in_db.model_dump(exclude={"password"}))

    def __ensure_email_is_available(self, email: str) -> None:
        if self.__user_repository.get_user_by_email(email):
            raise UserEmailAlreadyExistsError(email)

    def __ensure_phone_is_available(self, phone: str) -> None:
        if self.__user_repository.get_user_by_phone(phone):
            raise UserPhoneAlreadyExistsError(phone)

    def create_access_token(self, user: UserResponse) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": str(user.id), "role": user.role, "exp": expire}
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    def register(self, user_data: UserToCreateSchema) -> UserResponse:
        self.__ensure_email_is_available(user_data.email)
        self.__ensure_phone_is_available(user_data.phone)

        hashed = self.__hash_password(user_data.password)
        user_to_store = user_data.model_copy(update={"password": hashed, "role": "User"})
        created = self.__user_repository.create_user(user_to_store)
        return self.__to_public(created)

    def login(self, email: str, password: str) -> UserResponse:
        user = self.__user_repository.get_user_by_email(email)

        if not user or not self.__verify_password(password, user.password):
            raise InvalidCredentialsError()

        return self.__to_public(user)
