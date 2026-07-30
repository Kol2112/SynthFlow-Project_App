from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, status, Request
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import os
import re
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
activation_tokens = {}

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

def send_activation_email_background(email: str, token: str, background_tasks: BackgroundTasks):
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
    message = MessageSchema(
        subject="SynthFlow - Activate Your Account",
        recipients=[email],
        body=html_content,
        subtype=MessageType.html
    )
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

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def update_project_progress(project_id: int, db: Session):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        return
    main_tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exist.")
    secured_passwd = get_password_hash(user_data.password)
    new_user = models.User(
        email=user_data.email,
        hashed_password=secured_passwd,
        name=user_data.name,
        surname=user_data.surname,
        birth_date=user_data.birth_date,
        is_active=False,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = str(uuid.uuid4())
    activation_tokens[token] = user_data.email
    send_activation_email_background(user_data.email, token, background_tasks)
    return {"message": "Account succesful create", "user_id": new_user.id}

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login_usr(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, login_data.email)
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password!")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your account is not activate yet")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/forgot-password")
def forgot_password(login_data: schemas.UserLogin, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = get_user_by_email(db, login_data.email)
    if not user:
        return {"message": "If the account exists, a reset link has been sent."}
    token = str(uuid.uuid4())
    reset_tokens[token] = login_data.email
    send_reset_email_background(login_data.email, token, background_tasks)
    return {"message": "Reset link sent successfully."}

@app.post("/api/auth/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    if token not in reset_tokens:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token.")
    user = get_user_by_email(db, reset_tokens[token])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    del reset_tokens[token]
    return {"message": "Password updated successfully"}

@app.post("/api/auth/activate")
def activate_account(token: str, db: Session = Depends(get_db)):
    if token not in activation_tokens:
        raise HTTPException(status_code=400, detail="Inavlid or expired activation token.")
    user = db.query(models.User).filter(models.User.email == activation_tokens[token]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = True
    db.commit()
    del activation_tokens[token]
    return {"message": "Account activated successfully! You can now log in."}

@app.post("/api/projects", response_model=schemas.ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_new_project(project_data: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing_key = db.query(models.Project).filter(models.Project.project_key == project_data.project_key).first()
    if existing_key:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project with this key already exists.")

    github_repo_clean = None
    if project_data.github_repo:
        github_repo_clean = project_data.github_repo.strip().rstrip("/").removesuffix(".git")

    new_project = models.Project(
        name=project_data.name,
        project_key=project_data.project_key,
        desc=project_data.desc, 
        deadline=project_data.deadline,
        priority=project_data.priority,
        github_repo=github_repo_clean,
        owner_id=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@app.get("/api/projects", response_model=list[schemas.ProjectResponse])
def get_user_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Project).filter(models.Project.owner_id == current_user.id).all()

@app.get("/api/projects/by-key/{project_key}")
def get_project_details(project_key: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.project_key == project_key, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    columns = db.query(models.TaskColumn).filter(models.TaskColumn.project_id == project.id).order_by(models.TaskColumn.position).all()
    
    return {
        "id": project.id,
        "name": project.name,
        "project_key": project.project_key,
        "desc": project.desc,
        "github_repo": project.github_repo,
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
                        "progress_prec": t.progress_prec,
                        "savedProgressBackend": t.saved_progress,
                        "subtasks": [
                            {
                                "id": f"{t.id}_{idx + 1}",
                                "db_id": st.id,
                                "name": st.name,
                                "is_done": st.is_done,
                                "isCompleted": st.is_done,
                                "progress_prec": 100 if st.is_done else 0,
                                "savedProgress": 100 if st.is_done else 0
                            } for idx, st in enumerate(t.subtasks)
                        ]
                    } for t in col.tasks
                ]
            } for col in columns
        ]
    }

@app.post("/api/projects/{project_id}/columns", response_model=schemas.ColumnResponse, status_code=status.HTTP_201_CREATED)
def create_project_column(project_id: int, column_data: schemas.ColumnCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
    existing_count = db.query(models.TaskColumn).filter(models.TaskColumn.project_id == project_id).count()
    new_column = models.TaskColumn(name=column_data.name, position=existing_count, project_id=project_id)
    db.add(new_column)
    db.commit()
    db.refresh(new_column)
    return new_column

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
        raise HTTPException(status_code=404, detail="Project not found")

    start_date_datetime = datetime.combine(task_data.start_date, datetime.min.time()) if task_data.start_date else None
    deadline_datetime = datetime.combine(task_data.deadline, datetime.min.time()) if task_data.deadline else None
    new_task = models.Task(name=task_data.name, desc=task_data.desc, priority=task_data.priority, start_date=start_date_datetime, deadline=deadline_datetime, project_id=project_id, column_id=column_id)
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    if task_data.subtasks:
        total = len(task_data.subtasks)
        completed = 0
        for st in task_data.subtasks:
            sub = models.Subtask(
                name=st.name,
                is_done=st.is_done,
                task_id=new_task.id
            )
            db.add(sub)
            if st.is_done:
                completed += 1
        new_task.progress_prec = int((completed / total) * 100)
        new_task.saved_progress = new_task.progress_prec
        db.commit()
        db.refresh(new_task)
        
    update_project_progress(project_id, db)
    return new_task

@app.put("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int, 
    project_data: schemas.ProjectUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    project = db.query(models.Project).filter(
        models.Project.id == project_id, 
        models.Project.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")

    project.name = project_data.name
    project.desc = project_data.desc
    project.priority = project_data.priority

    if project_data.github_repo:
        project.github_repo = project_data.github_repo.strip().rstrip("/").removesuffix(".git")
    else:
        project.github_repo = None
    
    if project_data.deadline:
        project.deadline = datetime.combine(project_data.deadline, datetime.min.time())
    else:
        project.deadline = None

    db.commit()
    db.refresh(project)
    return project

@app.delete("/api/projects/{project_id}", status_code=200)
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@app.delete("/api/projects/{project_id}/columns/{column_id}", status_code=200)
def delete_column(project_id: int, column_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    column = db.query(models.TaskColumn).filter(models.TaskColumn.id == column_id, models.TaskColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
    db.delete(column)
    db.commit()
    update_project_progress(project_id, db)
    return {"message": "Column deleted successfully"}

@app.delete("/api/projects/{project_id}/columns/{column_id}/tasks/{task_id}", status_code=200)
def delete_task(project_id: int, column_id: int, task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.column_id == column_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    update_project_progress(project_id, db)
    return {"message": "Task deleted successfully"}

@app.put("/api/projects/{project_id}/columns/{column_id}", response_model=schemas.ColumnResponse)
def rename_column(project_id: int, column_id: int, column_data: schemas.ColumnCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    column = db.query(models.TaskColumn).filter(models.TaskColumn.id == column_id, models.TaskColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
    column.name = column_data.name
    db.commit()
    db.refresh(column)
    return column

@app.put("/api/projects/{project_id}/columns/{column_id}/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(project_id: int, column_id: int, task_id: int, task_data: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.column_id == column_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    task.name = task_data.name
    task.desc = task_data.desc
    task.priority = task_data.priority
    task.deadline = datetime.combine(task_data.deadline, datetime.min.time()) if task_data.deadline else None
    task.start_date = datetime.combine(task_data.start_date, datetime.min.time()) if task_data.start_date else None
    
    db.query(models.Subtask).filter(models.Subtask.task_id == task.id).delete()

    if task_data.subtasks:
        total = len(task_data.subtasks)
        completed = 0
        for st in task_data.subtasks:
            sub = models.Subtask(
                name=st.name,
                is_done=st.is_done,
                task_id=task.id
            )
            db.add(sub)
            if st.is_done:
                completed += 1
        task.progress_prec = int((completed / total) * 100)
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
    task.column_id = column_id
    db.commit()
    db.refresh(task)
    return {"id": task.id, "column_id": task.column_id, "message": "Task moved successfully"}

@app.put("/api/subtasks/{subtask_id}/toggle-complete")
def toggle_subtask_complete(subtask_id: int, toggle: schemas.TaskProgressToggle, db: Session = Depends(get_db)):
    subtask = db.query(models.Subtask).filter(models.Subtask.id == subtask_id).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")
    
    subtask.is_done = toggle.is_done
    db.commit()

    parent = db.query(models.Task).filter(models.Task.id == subtask.task_id).first()
    if parent:
        parent_subtasks = db.query(models.Subtask).filter(models.Subtask.task_id == parent.id).all() or []
        completed_count = sum(1 for st in parent_subtasks if st.is_done)
        
        new_parent_progress = int((completed_count / len(parent_subtasks)) * 100) if parent_subtasks else 0
        parent.progress_prec = new_parent_progress
        parent.saved_progress = new_parent_progress
        
        db.commit()
        db.refresh(parent)
        update_project_progress(parent.project_id, db)

    return {
        "type": "subtask",
        "id": subtask.id,
        "parent_id": subtask.task_id,
        "is_done": subtask.is_done
    }

@app.put("/api/tasks/{task_id}/toggle-complete")
def toggle_any_task_complete(task_id: int, toggle: schemas.TaskProgressToggle, db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    subtasks = db.query(models.Subtask).filter(models.Subtask.task_id == task_id).all() or []

    if toggle.is_done:
        task.saved_progress = task.progress_prec
        task.progress_prec = 100
        for sub in subtasks:
            sub.is_done = True
    else:
        if task.saved_progress == 100 or task.saved_progress == 0 or not subtasks:
            task.progress_prec = 0
            task.saved_progress = 0
            for sub in subtasks:
                sub.is_done = False
        else:
            task.progress_prec = task.saved_progress
            target_completed_count = int(round((task.saved_progress / 100.0) * len(subtasks)))
            
            for index, sub in enumerate(subtasks):
                sub.is_done = index < target_completed_count
                
            task.saved_progress = 0

    db.commit()
    db.refresh(task)
    update_project_progress(task.project_id, db)

    updated_subtasks = db.query(models.Subtask).filter(models.Subtask.task_id == task_id).all() or []

    return {
        "type": "parent_task",
        "id": task.id,
        "progress_prec": task.progress_prec,
        "subtasks": [
            {
                "id": f"{task.id}_{idx + 1}",
                "db_id": st.id,
                "name": st.name,
                "progress_prec": 100 if st.is_done else 0,
                "is_done": st.is_done,
                "isCompleted": st.is_done,
                "saved_progress": 100 if st.is_done else 0
            } for idx, st in enumerate(updated_subtasks)
        ]
    }

@app.post("/api/webhooks/github")
async def github_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    commits = payload.get("commits", [])
    print(f"Otrzymano webhook z GitHuba. Liczba commitów: {len(commits)}")
    
    for commit in commits:
        message = commit.get("message", "")
        print(f"Wiadomość commita: {message}")
        
        # 1. Szukamy wzorca subtaska np: #150_2 lub #1_1
        subtask_match = re.search(r'#(\d+)_(\d+)', message)
        
        if subtask_match:
            parent_id = int(subtask_match.group(1))
            subtask_order_num = int(subtask_match.group(2)) # Np. 2 dla drugiego podzadania
            print(f"Znaleziono Subtask: Zadanie #{parent_id}, Podzadanie numer: {subtask_order_num}")
            
            # Pobieramy subtaski zadania nadrzędnego
            parent_task = db.query(models.Task).filter(models.Task.id == parent_id).first()
            if parent_task:
                subtasks = db.query(models.Subtask).filter(models.Subtask.task_id == parent_id).all()
                # Indeksowanie w Pythonie jest od 0, więc subtask #150_2 ma indeks 1
                if 0 < subtask_order_num <= len(subtasks):
                    target_subtask = subtasks[subtask_order_num - 1]
                    target_subtask.is_done = True
                    db.commit()
                    
                    # Aktualizujemy postęp rodzica
                    completed_count = sum(1 for st in subtasks if st.is_done)
                    new_progress = int((completed_count / len(subtasks)) * 100)
                    parent_task.progress_prec = new_progress
                    parent_task.saved_progress = new_progress
                    
                    db.commit()
                    update_project_progress(parent_task.project_id, db)
                    print(f"Subzadanie #{parent_id}_{subtask_order_num} oznaczone jako wykonane!")
                else:
                    print(f"Brak subzadania o numerze porządkowym {subtask_order_num} dla zadania #{parent_id}")
            continue

        # 2. Jeśli nie dopasowano subtaska, szukamy pojedynczego zadania głównego np: #150
        main_match = re.search(r'#(\d+)', message)
        if main_match:
            target_id = int(main_match.group(1))
            print(f"Znaleziono ID zadania głównego: #{target_id}")
        
            task = db.query(models.Task).filter(models.Task.id == target_id).first()
            if task:
                task.progress_prec = 100
                task.saved_progress = 100
                
                subtasks = db.query(models.Subtask).filter(models.Subtask.task_id == task.id).all() or []
                for st in subtasks:
                    st.is_done = True
                
                db.commit()
                update_project_progress(task.project_id, db)
                print(f"Główne zadanie #{target_id} oraz jego podzadania zostały oznaczone jako ukończone!")
            else:
                print(f"Nie znaleziono w bazie zadania o ID #{target_id}")
            
    return {"status": "success", "message": "Webhook processed"}