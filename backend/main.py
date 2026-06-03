from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
import models
import schemas
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

#Sprawdzanie czy użytkownik istnieje (funkcja pomocnicza)

def get_user_by_email(db: Session, email:str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
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
        is_active = True,
        is_verified = False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
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