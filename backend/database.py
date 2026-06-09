from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
SQL_DB_URL = "postgresql://postgres:123@localhost:5432/synthflow_db"

engine = create_engine(SQL_DB_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()

def get_db():
    db= SessionLocal()
    try:
        yield db
    finally:
        db.close()