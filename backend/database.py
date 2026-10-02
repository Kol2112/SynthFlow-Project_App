import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

SQL_DB_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:123@localhost:5432/synthflow_db"
)

if SQL_DB_URL and SQL_DB_URL.startswith("postgres://"):
    SQL_DB_URL = SQL_DB_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(SQL_DB_URL,pool_pre_ping=True, pool_recycle=300, pool_size=10, max_overflow=20)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
