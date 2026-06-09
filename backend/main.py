from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, status
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
import models, schemas

from database import get_db
from auth import get_password_hash, verify_password, create_access_token
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
#Ustawienie poczty pod recovery page
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
#Funkcja wysyłająca maila do aktywacji
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
#Funkcja do wysyłania maila resetującego hasło
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


#Sprawdzanie czy użytkownik istnieje
def get_user_by_email(db: Session, email:str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


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

#Endpoint do logowania użytkownika

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
    db.commit();
    del reset_tokens[token]
    return {"message": "Password updated successfully"}

@app.post("/api/auth/activate")
def activate_account(token: str, db: Session = Depends(get_db)):
    if token not in activation_tokens:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inavlid or expired activation token.")
    email = activation_tokens[token]
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    
    user.is_active = True
    db.commit()
    del activation_tokens[token]
    return{
        "message":"Account activated successfully! You can now log in."
    }