from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from backend.models import CalorieRecord, SessionLocal
from pydantic import BaseModel
from datetime import date

app = FastAPI()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model for request body
class CalorieRecordCreate(BaseModel):
    date: date
    food: str
    calories: int

@app.get("/")
def read_root():
    return {"message": "Welcome to the Diet Diary API!"}

@app.get("/records")
def get_records(db: Session = Depends(get_db)):
    records = db.query(CalorieRecord).all()
    return records

@app.post("/records")
def create_record(record: CalorieRecordCreate, db: Session = Depends(get_db)):
    db_record = CalorieRecord(date=record.date, food=record.food, calories=record.calories)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record
