from schemas.auth_schemas import AuthResponse
from services.auth_service import AuthService


class AuthController:
    __auth_service: AuthService

    def __init__(self, auth_service: AuthService):
        self.__auth_service = auth_service

    def register(self, user_data) -> AuthResponse:
        user = self.__auth_service.register(user_data)
        token = self.__auth_service.create_access_token(user)
        return AuthResponse(message="Register Successful", access_token=token, user=user)

    def login(self, email: str, password: str) -> AuthResponse:
        user = self.__auth_service.login(email, password)
        token = self.__auth_service.create_access_token(user)
        return AuthResponse(message="Login Successful", access_token=token, user=user)
