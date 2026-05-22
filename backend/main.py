from fastapi import FastAPI, Depends, HTTPException, status

from database import engine, get_db
app = FastAPI()
