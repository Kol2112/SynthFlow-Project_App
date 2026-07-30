from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, date
from typing import Optional, List, Union

# Schemat użytkownika

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Hasło musi mieć minimum 8 znaków")
    name: str = Field(..., min_length=2, max_length=50)
    surname: str = Field(..., min_length=2, max_length=50)
    birth_date: Optional[datetime] = None

# Schemat logowania

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schemat dla frontendu
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

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class ProjectCreate(BaseModel):
    name: str
    project_key: str
    desc: Optional[str] = None
    deadline: Optional[date] = None
    priority: str = "Low"
    tags: Optional[str] = None
    github_repo: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: str
    desc: Optional[str] = None
    deadline: Optional[date] = None
    priority: str = "Low"
    github_repo: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    project_key: str
    desc: Optional[str] = None
    deadline: Optional[date] = None
    priority: str
    progress_prec: int
    tags: Optional[str] = None
    github_repo: Optional[str] = None
    owner_id: int

    class Config:
        from_attributes = True

class ColumnCreate(BaseModel):
    name: str

class ColumnResponse(BaseModel):
    id: int
    name: str
    position: int
    project_id: int
    
    class Config:
        from_attributes = True

class ColumnOrderUpdate(BaseModel):
    column_ids: List[int]

class SubtaskSchema(BaseModel):
    id: Optional[str] = None
    name: str
    is_done: bool = False

class SubTaskCreate(BaseModel):
    id: Optional[Union[int, str]] = None
    name: str
    is_done: bool = False

class SubTaskResponse(BaseModel):
    id: int
    name: str
    is_done: bool
    task_id: int

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    desc: Optional[str] = None
    priority: str = "Low"
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    subtasks: Optional[List[SubTaskCreate]] = []

class TaskResponse(BaseModel):
    id: int
    name: str
    desc: Optional[str]
    priority: str
    start_date: Optional[date]
    deadline: Optional[date]
    created_at: datetime
    saved_progress: int
    progress_prec: int
    project_id: int
    column_id: int
    subtasks: List[SubTaskResponse] = []

    class Config:
        from_attributes = True

class TaskProgressToggle(BaseModel):
    is_done: bool