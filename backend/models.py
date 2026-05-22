from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class userDB(Base):
        __tablename__="users"

        id=Column(Integer, primary_key=True, index=True)
        email =Column(String, unique=True, index=True, nullable=False)
        hashed_password = Column(String, nullable= False)

        name =Column(String, index=True, nullable=True)
        surname =Column(String, index=True, nullable=True)
        birthDate =Column(Date, index=True, nullable=True)

        is_active = Column(Boolean, default=False, nullable=False)
        is_verified = Column(Boolean, default=False, nullable=False)