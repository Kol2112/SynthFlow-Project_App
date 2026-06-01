from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

#Schemat użytkownika

class UserRegister(BaseModel):
    email:EmailStr
    password: str = Field(..., min_length=8, description = "Hasło musi mieć minimum 8 znaków")
    name: str = Field(...,min_length=2, max_length=50)
    surname: str = Field(..., min_length=50)
    birth_date: Optional[datetime] = None

#Schemat logowania

class UserLogin(BaseModel):
    email:EmailStr
    password:str

#Schemat dla frontendu
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]
    surname: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True