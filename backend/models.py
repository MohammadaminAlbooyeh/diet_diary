from sqlalchemy import Column, Integer, String, Date, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class CalorieRecord(Base):
    __tablename__ = "calorie_records"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    food = Column(String, nullable=False)
    calories = Column(Integer, nullable=False)

# SQLite engine
engine = create_engine("sqlite:///./calories.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)
