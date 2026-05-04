"""Auth schemas — login, register, and token responses."""
from pydantic import BaseModel, EmailStr, Field, model_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    @model_validator(mode="after")
    def validate_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Confirm password must match password")
        return self


class RegisterUserInfo(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str


class RegisterResponse(BaseModel):
    message: str
    user: RegisterUserInfo


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int | None = None
    email: str | None = None
    role: str | None = None
