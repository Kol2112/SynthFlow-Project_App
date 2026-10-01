import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text, Table
from sqlalchemy.orm import relationship
from database import Base

task_assignees = Table(
    "task_assignees",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)

# Statusy zaproszeń/oczekiwań do projektów
class InvitationStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"

# Etapy stanów zadań/projektów
class TaskStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    REVIEW = "REVIEW"
    DONE = "DONE"

# Priorytety zadań i projektów
class TaskPriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

# Tabela członków projektu (Asocjacyjna)
class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    status = Column(Enum(InvitationStatus), default=InvitationStatus.PENDING, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)

# Tabela użytkownika
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    name = Column(String, index=True, nullable=True)
    surname = Column(String, index=True, nullable=True)
    birth_date = Column(DateTime, nullable=True)
    avatar_url = Column(Text, nullable=True)

    is_active = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owned_projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    projects = relationship("Project", secondary="project_members", back_populates="members")
    assigned_tasks = relationship("Task", secondary=task_assignees, back_populates="assignees")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

# Tabela projektu
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    project_key = Column(String, unique=True, index=True, nullable=False)
    desc = Column(String, nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.LOW, nullable=False)
    deadline = Column(DateTime, nullable=True)
    progress_prec = Column(Integer, default=0, nullable=False)
    github_repo = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    columns = relationship("TaskColumn", back_populates="project", order_by="TaskColumn.position", cascade="all, delete-orphan")
    
    owner = relationship("User", back_populates="owned_projects")
    members = relationship("User", secondary="project_members", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    logs = relationship("ActivityLog", back_populates="project", cascade="all, delete-orphan")


class TaskColumn(Base):
    __tablename__ = "task_columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    position = Column(Integer, default=0, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    project = relationship("Project", back_populates="columns")
    tasks = relationship("Task", back_populates="column", order_by="Task.position", cascade="all, delete-orphan")

# Tabela zadań
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    desc = Column(Text, nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.LOW, nullable=False)
    deadline = Column(DateTime, nullable=True)
    start_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    saved_progress = Column(Integer, default=0, nullable=False)
    progress_prec = Column(Integer, default=0, nullable=False)
    position = Column(Integer, default=0, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    column_id = Column(Integer, ForeignKey("task_columns.id", ondelete="CASCADE"), nullable=True)

    project = relationship("Project", back_populates="tasks")
    column = relationship("TaskColumn", back_populates="tasks")
    assignees = relationship("User", secondary=task_assignees, back_populates="assigned_tasks")
    subtasks = relationship("Subtask", back_populates="task", cascade="all, delete-orphan")

    @property
    def is_done(self) -> bool:
        return self.progress_prec == 100


# Osobna tabela subzadań
class Subtask(Base):
    __tablename__ = "subtasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    is_done = Column(Boolean, default=False, nullable=False)
    
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)

    task = relationship("Task", back_populates="subtasks")


# Tabela logów
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    action_text = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    project = relationship("Project", back_populates="logs")
    user = relationship("User")

class PendingChange(Base):
    __tablename__ = "pending_changes"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    data_json = Column(Text, nullable=False)
    expires_at = Column(DateTime, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False) # np. 'PROJECT_INVITE', 'TASK_ASSIGNED'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)

    user = relationship("User", back_populates="notifications")