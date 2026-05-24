from abc import ABC


class BusinessError(ABC, Exception):
    status_code: int
    message: str

    def __init__(self, message: str):
        self.message = message

class UserNotFoundError(BusinessError):
    status_code = 404

    def __init__(self, user_id: int):
        super().__init__(f"User with id {user_id} not found")

class UserEmailAlreadyExistsError(BusinessError):
    status_code = 400

    def __init__(self, email: str):
        super().__init__(f"User with email {email} already exists")

class UserPhoneAlreadyExistsError(BusinessError):
    status_code = 400

    def __init__(self, phone: str):
        super().__init__(f"User with phone {phone} already exists")

class InvalidCredentialsError(BusinessError):
    status_code = 401

    def __init__(self):
        super().__init__("Invalid email or password")
