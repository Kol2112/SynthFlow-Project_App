from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, status
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
import models, schemas

from database import get_db
from auth import get_password_hash, verify_password, create_access_token, get_current_user
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
reset_tokens = {}
activation_tokens={}

mail_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "test@synthflow.local"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 2525)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "sandbox.smtp.mailtrap.io"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def send_activation_email_background(email:str, token: str, background_tasks: BackgroundTasks):
    activation_link = f"http://localhost:5173/activate?token={token}"

    html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 6px;">
            <h2 style="color: #24292e;">Witaj w SynthFlow!</h2>
            <p>Dziękujemy za rejestrację. Twoje konto zostało pomyślnie utworzone.</p>
            <p>Aby móc się zalogować, musisz najpierw aktywować swoje konto, klikając w poniższy przycisk:</p>
            <div style="margin: 25px 0;">
                <a href="{activation_link}" target="_blank" style="padding: 12px 24px; background-color: #0366d6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Aktywuj konto</a>
            </div>
            <p style="color: #586069; font-size: 0.9rem;">Jeśli nie rejestrowałeś się w naszym serwisie, zignoruj tę wiadomość.</p>
        </div>
    """
    message = MessageSchema(subject="SynthFlow - Activate Your Account",
                            recipients=[email],
                            body = html_content,
                            subtype= MessageType.html)
    fm = FastMail(mail_config)
    background_tasks.add_task(fm.send_message, message)

def send_reset_email_background(email: str, token: str, background_tasks: BackgroundTasks):
    reset_link = f"http://localhost:5173/recovery?token={token}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 6px;">
        <h2 style="color: #24292e;">SynthFlow - Resetowanie hasła</h2>
        <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.</p>
        <p>Kliknij w poniższy przycisk, aby ustawić nowe hasło:</p>
        <div style="margin: 25px 0;">
            <a href="{reset_link}" target="_blank" style="padding: 12px 24px; background-color: #2ea44f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Resetuj hasło</a>
        </div>
        <p style="color: #586069; font-size: 0.9rem;">Jeśli to nie Ty wysłałeś to zgłoszenie, po prostu zignoruj tę wiadomość.</p>
    </div>
    """
    
    message = MessageSchema(
        subject="SynthFlow - Password Reset Request",
        recipients=[email],
        body=html_content,
        subtype=MessageType.html
    )
    
    fm = FastMail(mail_config)
    background_tasks.add_task(fm.send_message, message)

def get_user_by_email(db: Session, email:str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def update_project_progress(project_id: int, db: Session):
    """Przelicza średni postęp projektu i zapisuje go bezpośrednio w bazie PostgreSQL"""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        return
    
    main_tasks = db.query(models.Task).filter(
        models.Task.project_id == project_id,
        models.Task.parent_id == None
    ).all()
    
    if not main_tasks:
        project.progress_prec = 0
    else:
        total_progress = sum(task.progress_prec for task in main_tasks)
        project.progress_prec = int(total_progress / len(main_tasks))
        
    db.commit()

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):    
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,  
            detail="User with this email already exist."
        )
    
    secured_passwd = get_password_hash(user_data.password)

    new_user = models.User(
        email=user_data.email,
        hashed_password=secured_passwd,
        name = user_data.name,
        surname = user_data.surname,
        birth_date = user_data.birth_date,
        is_active = False,
        is_verified = False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = str(uuid.uuid4())
    activation_tokens[token] = user_data.email

    send_activation_email_background(user_data.email, token, background_tasks)

    return{
        "message":"Account succesful create",
        "user_id": new_user.id
    }

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login_usr(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, login_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Bad login or password!")
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password!"
        )
    if not user.is_active:
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail="Your account is not activate yet"
        )
    
    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@app.post("/api/auth/forgot-password")
def forgot_password(login_data: schemas.UserLogin, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = login_data.email
    user = get_user_by_email(db, email)

    if not user:
        return{"message": "If the account exists, a reset link has been sent."}

    token = str(uuid.uuid4())
    reset_tokens[token] = email
    send_reset_email_background(email, token, background_tasks)
    return {"message": "Reset link sent successfully."}

@app.post("/api/auth/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    if token not in reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    mail = reset_tokens[token]
    user = get_user_by_email(db, mail)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found."
        )
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    del reset_tokens[token]
    return {"message": "Password updated successfully"}

@app.post("/api/auth/activate")
def activate_account(token: str, db: Session = Depends(get_db)):
    if token not in activation_tokens:
        raise HTTPException(
            status_code=400,
            detail="Inavlid or expired activation token."
        )
    
    email = activation_tokens[token]
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )
    
    user.is_active = True
    db.commit()

    del activation_tokens[token]
    
    return {"message": "Account activated successfully! You can now log in."}

@app.post("/api/projects", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(project_data: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing_key = db.query(models.Project).filter(models.Project.project_key == project_data.project_key).first()
    if existing_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project with this key already exists."
        )
        
    new_project = models.Project(
        name=project_data.name,
        project_key=project_data.project_key,
        desc=project_data.desc, 
        deadline=project_data.deadline,
        priority=project_data.priority,
        owner_id=current_user.id
    )
    
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project

@app.get("/api/projects", response_model=list[schemas.ProjectResponse])
def get_user_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    projects = db.query(models.Project).filter(models.Project.owner_id == current_user.id).all()
    return projects

@app.post("/api/projects/{project_id}/columns", response_model = schemas.ColumnResponse, status_code = status.HTTP_201_CREATED)
def create_project_column(project_id: int, column_data: schemas.ColumnCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code = 404, detail ="Project not found or access denied")
    existing_columns_count = db.query(models.TaskColumn).filter(models.TaskColumn.project_id==project_id).count()
    new_column= models.TaskColumn(name = column_data.name, position = existing_columns_count, project_id = project_id)
    db.add(new_column)
    db.commit()
    db.refresh(new_column)
    return new_column

@app.get("/api/projects/by-key/{project_key}")
def get_project_details(project_key: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.project_key == project_key, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    try:
        columns = db.query(models.TaskColumn).filter(models.TaskColumn.project_id == project.id).order_by(models.TaskColumn.position).all()
    except Exception as e:
        print(f"DATABASE ERROR WHILE FETCHING COLUMNS: {e}")
        columns = []
    
    response_data = {
        "id": project.id,
        "name": project.name,
        "project_key": project.project_key,
        "desc": project.desc,
        "deadline": str(project.deadline) if project.deadline else None,
        "priority": project.priority,
        "progress": project.progress_prec,
        "columns": [
            {
                "id": col.id,
                "name": col.name,
                "position": col.position,
                "tasks": [
                    {
                        "id": t.id,
                        "name": t.name,
                        "desc": t.desc,
                        "priority": t.priority,
                        "startDate": t.start_date.strftime("%Y-%m-%d") if t.start_date else "",
                        "date": t.deadline.strftime("%d-%m-%Y") if t.deadline else "No deadline",
                        "progress": t.progress_prec,
                        "savedProgressBackend": t.saved_progress,
                        "subtasks": [
                            {
                                "id": st.id,
                                "name": st.name,
                                "is_done": st.progress_prec == 100,
                                "savedProgress": st.saved_progress
                            } for st in t.subtasks
                        ]
                    } for t in col.tasks if t.parent_id is None
                ]
            } for col in columns
        ]
    }
    return response_data

@app.post("/api/projects/{project_id}/columns", response_model=schemas.ColumnResponse)
def create_column(project_id: int, column_data: schemas.ColumnCreate, db: Session = Depends(get_db)):
    current_count = db.query(models.TaskColumn).filter(models.TaskColumn.project_id == project_id).count()
    new_col = models.TaskColumn(name=column_data.name, position=current_count, project_id=project_id)
    db.add(new_col)
    db.commit()
    db.refresh(new_col)
    return new_col

@app.put("/api/projects/{project_id}/columns/reorder")
def reorder_columns(project_id: int, order_data: schemas.ColumnOrderUpdate, db: Session = Depends(get_db)):
    for index, col_id in enumerate(order_data.column_ids):
        column = db.query(models.TaskColumn).filter(models.TaskColumn.id == col_id, models.TaskColumn.project_id == project_id).first()
        if column:
            column.position = index
    db.commit()
    return {"message": "Columns order updated successfully"}

@app.post("/api/projects/{project_id}/columns/{column_id}/tasks", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(project_id: int, column_id: int, task_data: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
    column = db.query(models.TaskColumn).filter(models.TaskColumn.id == column_id, models.TaskColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")

    start_date_datetime = datetime.combine(task_data.start_date, datetime.min.time()) if task_data.start_date else None
    deadline_datetime = datetime.combine(task_data.deadline, datetime.min.time()) if task_data.deadline else None
    new_task = models.Task(name = task_data.name, desc=task_data.desc, priority=task_data.priority, start_date=start_date_datetime, deadline=deadline_datetime, project_id = project_id, column_id= column_id)
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    if task_data.subtasks:
        total = len(task_data.subtasks)
        completed = 0
        for st in task_data.subtasks:
            init_progress = 100 if st.is_done else 0
            sub = models.Task(
                name=st.name, 
                project_id=project_id, 
                column_id=column_id, 
                parent_id=new_task.id, 
                progress_prec=init_progress,
                saved_progress=init_progress
            )
            db.add(sub)
            if st.is_done:
                completed += 1
        new_task.progress_prec = int((completed/total)*100)
        new_task.saved_progress = new_task.progress_prec
        db.commit()
        db.refresh(new_task)
        
    update_project_progress(project_id, db)
    return new_task

@app.put("/api/tasks/{task_id}/toggle-complete")
def toggle_task_complete(task_id: int, toggle: schemas.TaskProgressToggle, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail = "Task not found")
    
    if toggle.is_done:
        task.saved_progress = task.progress_prec
        task.progress_prec = 100
        subtasks = db.query(models.Task).filter(models.Task.parent_id == task_id).all()
        for sub in subtasks:
            sub.saved_progress = sub.progress_prec
            sub.progress_prec = 100
    else:
        task.progress_prec = task.saved_progress if task.saved_progress < 100 else 0
        subtasks = db.query(models.Task).filter(models.Task.parent_id == task_id).all()
        for sub in subtasks:
            sub.progress_prec = sub.saved_progress
            
    db.commit()
    
    update_project_progress(task.project_id, db)
    
    return {"id": task.id, "progress_prec": task.progress_prec}

@app.delete("/api/projects/{project_id}", status_code=200)
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or unauthorized")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@app.delete("/api/projects/{project_id}/columns/{column_id}", status_code=200)
def delete_column(project_id: int, column_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
    
    column = db.query(models.TaskColumn).filter(models.TaskColumn.id == column_id, models.TaskColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
        
    db.delete(column)
    db.commit()
    
    update_project_progress(project_id, db)
    return {"message": "Column and its tasks deleted successfully"}

@app.delete("/api/projects/{project_id}/columns/{column_id}/tasks/{task_id}", status_code=200)
def delete_task(project_id: int, column_id: int, task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
        
    column = db.query(models.TaskColumn).filter(models.TaskColumn.id == column_id, models.TaskColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
        
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.column_id == column_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db.delete(task)
    db.commit()
    
    update_project_progress(project_id, db)
    return {"message": "Task deleted successfully"}

@app.put("/api/projects/{project_id}/columns/{column_id}", response_model=schemas.ColumnResponse)
def rename_column(project_id: int, column_id: int, column_data: schemas.ColumnCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
        
    column = db.query(models.TaskColumn).filter(models.TaskColumn.id == column_id, models.TaskColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
        
    column.name = column_data.name
    db.commit()
    db.refresh(column)
    return column

@app.put("/api/projects/{project_id}/columns/{column_id}/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(project_id: int, column_id: int, task_id: int, task_data: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
        
    column = db.query(models.TaskColumn).filter(models.TaskColumn.id == column_id, models.TaskColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
        
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.column_id == column_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task.name = task_data.name
    task.desc = task_data.desc
    task.priority = task_data.priority
    task.deadline = datetime.combine(task_data.deadline, datetime.min.time()) if task_data.deadline else None
    task.start_date = datetime.combine(task_data.start_date, datetime.min.time()) if task_data.start_date else None
    
    db.query(models.Task).filter(models.Task.parent_id == task.id).delete()

    if task_data.subtasks:
        total = len(task_data.subtasks)
        completed = 0
        for st in task_data.subtasks:
            init_progress = 100 if st.is_done else 0
            sub = models.Task(
                name=st.name, 
                project_id=project_id, 
                column_id=column_id, 
                parent_id=task.id, 
                progress_prec=init_progress,
                saved_progress=init_progress
            )
            db.add(sub)
            if st.is_done:
                completed += 1
        task.progress_prec = int((completed/total)*100)
        task.saved_progress = task.progress_prec
    else:
        task.progress_prec = 0
        task.saved_progress = 0

    db.commit()
    db.refresh(task)
    update_project_progress(project_id, db)
    return task

@app.put("/api/tasks/{task_id}/move")
def move_task(task_id: int, column_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    column = db.query(models.TaskColumn).filter(models.TaskColumn.id == column_id, models.TaskColumn.project_id == task.project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Invalid destination column")
    
    task.column_id = column_id
    db.commit()
    db.refresh(task)

    return {"id": task.id, "column_id": task.column_id, "message": "Task moved successfully"}