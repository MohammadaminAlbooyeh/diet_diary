# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware # Import CORS middleware

import models, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# --- CORS Configuration ---
# These are the origins that are allowed to make requests to your backend
origins = [
    "http://localhost",
    "http://localhost:5173", # Your React app's default address
    "http://127.0.0.1:5173",  # Another common local address for React
    # You can add other frontend URLs here if needed (e.g., production URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)
# --- End CORS Configuration ---


# Pydantic model for creating a new Calorie Entry (for request body)
class CalorieEntryCreate(BaseModel):
    food_name: str
    calories: float

# Pydantic model for reading Calorie Entry (for response body)
class CalorieEntryResponse(BaseModel):
    id: int
    food_name: str
    calories: float
    consumed_at: str

    class Config:
        orm_mode = True

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI with Database!"}

@app.post("/entries/", response_model=CalorieEntryResponse)
def create_calorie_entry(entry: CalorieEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.CalorieEntry(food_name=entry.food_name, calories=entry.calories)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/entries/", response_model=list[CalorieEntryResponse])
def read_calorie_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    entries = db.query(models.CalorieEntry).offset(skip).limit(limit).all()
    return entries