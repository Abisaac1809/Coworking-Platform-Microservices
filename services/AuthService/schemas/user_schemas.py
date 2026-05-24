from pydantic import BaseModel, ConfigDict, Field, EmailStr
from datetime import datetime


class UserToCreateSchema(BaseModel):
    name: str = Field(
        title='Full Name',
        min_length=3,
        max_length=100
    )

    email: EmailStr

    phone: str = Field(
        title='Phone Number',
        pattern=r'^\+[0-9]{2} [0-9]{3}-[0-9]{7}$',
        examples=['+57 300-1234567']
    )

    password: str = Field(
        title='Password',
        min_length=6,
        max_length=30
    )

    role: str = Field(
        title='Role',
        default='User',
        pattern='^(User|Admin)$'
    )


class UserInDb(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str
    created_at: datetime
    updated_at: datetime


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(title='User ID')

    name: str = Field(
        title='Full Name',
        min_length=3,
        max_length=100
    )

    email: EmailStr

    phone: str = Field(
        title='Phone Number',
        pattern=r'^\+[0-9]{2} [0-9]{3}-[0-9]{7}$',
        examples=['+57 300-1234567']
    )

    role: str = Field(title='User Role')

    created_at: datetime = Field(title='Creation Date')

    updated_at: datetime = Field(title='Last Update Date')
