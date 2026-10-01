from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, date
from typing import Optional, List, Union

# Schemat użytkownika

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(
        ..., 
        min_length=12, 
        description="Password must be at least 12 characters long"
    )
    name: Optional[str] = None
    surname: Optional[str] = None
    birth_date: Optional[datetime] = None

    @field_validator('name', 'surname', mode='before')
    @classmethod
    def validate_names_not_empty(cls, value: str, info) -> str:
        field_name = info.field_name.capitalize()
        
        if value is None or not str(value).strip():
            raise ValueError(f"{field_name} is required and cannot be empty.")
                
        value_str = str(value).strip()
        if len(value_str) < 2:
            raise ValueError(f"{field_name} must be at least 2 characters long.")
            
        return value_str

# Schemat logowania

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserEmailUpdate(BaseModel):
    new_email: EmailStr
    password: str = Field(..., description="Current password required to confirm the change")

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=12, description="The new password must be at least 12 characters long")

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=12, description="The new password must be at least 8 characters long")

# Schemat dla frontendu
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str]
    surname: Optional[str]
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AvatarUpdate(BaseModel):
    avatar_url: str

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

class ProjectMemberUserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    surname: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    desc: Optional[str] = None
    priority: str = "Low"
    start_date: Optional[date] = None
    deadline: Optional[date] = None
    assignee_ids: Optional[List[int]] = []
    subtasks: Optional[List[SubTaskCreate]] = []
    @field_validator('name', mode='before')
    @classmethod
    def validate_task_name(cls, value: str) -> str:
        if value is None or not str(value).strip():
            raise ValueError("Task name cannot be empty.")
        return str(value).strip()

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
    assignees: List[ProjectMemberUserResponse] = []
    subtasks: List[SubTaskResponse] = []

    class Config:
        from_attributes = True

class TaskSimpleResponse(BaseModel):
    id: int
    name: str
    desc: Optional[str] = None
    priority: str
    deadline: Optional[date] = None
    progress_prec: int
    assignees: List[ProjectMemberUserResponse] = []

    class Config:
        from_attributes = True

class TaskProgressToggle(BaseModel):
    is_done: bool
class TaskOrderUpdate(BaseModel):
    task_ids: List[int]

class ProjectJoinRequest(BaseModel):
    project_key: str = Field(..., min_length=1, description="Project key, which for user want to join")

class JoinRequestResponse(BaseModel):
    message: str
    expires_at: datetime

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
    members: List[ProjectMemberUserResponse] = []
    tasks: List[TaskSimpleResponse] = []

    class Config:
        from_attributes = True

class AddMemberRequest(BaseModel):
    email: EmailStr

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    project_id: Optional[int] = None
    task_id: Optional[int] = None

    class Config:
        from_attributes = True