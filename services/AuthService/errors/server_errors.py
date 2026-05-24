from abc import ABC


class InternalServerError(ABC, Exception):
    status_code: int
    message: str

    def __init__(self, message: str):
        self.message = message


class DatabaseConnectionError(InternalServerError):
    status_code = 500

    def __init__(self):
        super().__init__("Database connection error")
