import enum
import datetime
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Enum, Text
from sqlalchemy.orm import relationship
from database import Base

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
    MEDMIUM = "Medium"
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

# Tabela użytkownika
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    name = Column(String, index=True, nullable=True)
    surname = Column(String, index=True, nullable=True)
    birth_date = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owned_projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    projects = relationship("Project", secondary="project_members", back_populates="members")
    assigned_tasks = relationship("Task", back_populates="assignee")

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
    tasks = relationship("Task", back_populates="column", cascade="all, delete-orphan")


# Tabela zadań
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    desc = Column(Text, nullable=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.LOW, nullable=False)
    # status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    deadline = Column(DateTime, nullable=True)
    start_date = Column(DateTime, nullable=True) # Dodano start_date
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    saved_progress = Column(Integer, default=0, nullable=False)
    progress_prec = Column(Integer, default=0, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    column_id = Column(Integer, ForeignKey("task_columns.id", ondelete="CASCADE"), nullable=True)
    assignee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    parent_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)

    project = relationship("Project", back_populates="tasks")
    column = relationship("TaskColumn", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")
    
    parent = relationship("Task", remote_side=[id], back_populates="subtasks")
    subtasks = relationship("Task", back_populates="parent", cascade="all, delete-orphan")
    @property
    def is_done(self) -> bool:
        return self.progress_prec == 100


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