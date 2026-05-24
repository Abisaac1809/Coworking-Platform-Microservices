from pydantic import BaseModel, EmailStr
from schemas.user_schemas import UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
