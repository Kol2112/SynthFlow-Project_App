import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Enum, Text
from sqlalchemy.orm import relationship
from database import Base

#Statusy zaproszeń/oczekiwań do projektów
class InvitationStatus(str, enum.Enum):
        PENDING = "PENDING"
        ACCEPTED = "ACCEPTED"
        REJECTED = "REJECTED"
#Etapy stanów zadań/projektów
class TaskStatus(str, enum.Enum):
        TODO = "TODO"
        IN_PROGRESS = "IN_PROGRESS"
        REVIEW = "REVIEW"
        DONE = "DONE"

#Priorytety zadań i projektów
class TaskPriority(str, enum.Enum):
        LOW = "Low"
        MEDMIUM = "Medium"
        HIGH = "High"
        CRITICAL = "Critical"

#Table członków projektu
class ProjectMember(Base):
        __tablename__="project_members"

        id=Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
        project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

        status = Column(Enum(InvitationStatus), default=InvitationStatus.PENDING, nullable= False)
        joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
#Table użytkownika
class User(Base):
        __tablename__="users"

        id=Column(Integer, primary_key=True, index=True)
        email =Column(String, unique=True, index=True, nullable=False)
        hashed_password = Column(String, nullable= False)

        name =Column(String, index=True, nullable=True)
        surname =Column(String, index=True, nullable=True)
        birth_date =Column(DateTime, nullable=True)

        is_active = Column(Boolean, default=False, nullable=False)
        is_verified = Column(Boolean, default=False, nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

        owned_projects=relationship("Project", back_populates="owner", cascade="all, delete-orphan")
        projects = relationship("Project", secondary = "projet_members", back_populates="members")
        assigned_tasks = relationship("Task", back_populates="assignee")

#Table projektu
class Project(Base):
        __tablename__="projects"

        id=Column(Integer, primary_key= True, index= True)
        name = Column(String, index = True, nullable=False)
        project_key = Column(String, unique = True, index = True, nullable = False)
        desc = Column(Text, nullable = True)
        priority = Column(Enum(TaskPriority), default=TaskPriority.LOW, nullable = False)
        deadline = Column(DateTime, nullable = True)
        progress_prec = Column(Integer, default = 0, nullable = 0)
        github_repo = Column(String, nullable = True)
        created_at = Column(DateTime, default = datetime.utcnow, nullable = False)

        owner_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable= False)
        
        owner = relationship("User", back_populates = "owned_projects")
        members = relationship("User", secondary="project_members", back_populates = "projects")
        tasks = relationship("Task", back_populates = "project", cascade = "all, delete-orphan")
        logs = relationship("ActivityLog", back_populates="project", cascade="all, delete-orphan")

#Tabela zadań
class Task(Base):
        __tablename__= "tasks"

        id=Column(Integer, primary_key= True, index= True)
        name = Column(String, index = True, nullable=False)
        desc = Column(Text, nullable = True)
        priority = Column(Enum(TaskPriority), default=TaskPriority.LOW, nullable = False)
        status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable = False)
        deadline = Column(DateTime, nullable = True)
        created_at = Column(DateTime, default = datetime.utcnow, nullable = False)

        project_id = Column(Integer, ForeignKey("project,id", ondelete="CASCADE"), nullable=False)
        assignee_id = Column(Integer, ForeignKey("user,id", ondelete="SET NULL"), nullable=True)
        parent_id = Column(Integer, ForeignKey("task,id", ondelete="CASCADE"), nullable=True)

        project = relationship("Project", back_populates="tasks")
        assignee = relationship("User", back_populates = "assigned_tasks")
        subtasks = relationship('Task', backref=relationship("parent", remote_side=[id]), cascade="all, delete-orphan")

#Tabela logów

class ActivityLog(Base):
        __tablename__ = "activity_logs"

        id=Column(Integer, primary_key=True, index=True)
        action_text = Column(String, nullable =False)
        created_at = Column(DateTime, default=datetime.utcnow, nullable = False)

        project_id = Column(Integer, ForeignKey("project,id", ondelete="CASCADE"), nullable=False)
        user_id = Column(Integer, ForeignKey("user.id", ondelete="Set Null"), nullable = True)

        project = relationship("Project", back_populates = "logs")
        user = relationship("User")