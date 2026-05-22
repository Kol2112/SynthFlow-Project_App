from pydantic import BaseModel, EmailStr, Field
from datetime import date

class CreateUser(BaseModel):
    email: EmailStr
    password: str
    name: str
    surname: str
    birthDate: date = Field