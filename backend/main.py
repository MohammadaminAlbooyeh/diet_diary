# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status # Import status for HTTP status codes
from sqlalchemy.orm import Session
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict
from datetime import datetime # Import datetime for explicit conversion

import models, database
import food_data

# Create database tables when the application starts
# This will create the 'calorie_entries' table if it doesn't already exist.
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS (Cross-Origin Resource Sharing) Configuration
# This allows your React frontend (running on a different port) to communicate with this backend.
origins = [
    "http://localhost",
    "http://localhost:5173",   # Default address for React Vite development server
    "http://127.0.0.1:5173",   # Another common local address for React Vite
    # Add your production frontend URL here when you deploy your app
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Specific origins allowed to make requests
    allow_credentials=True,         # Allow cookies to be included in cross-origin HTTP requests
    allow_methods=["*"],            # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],            # Allow all headers
)

# Pydantic model for the request body when creating a new Calorie Entry
class CalorieEntryCreate(BaseModel):
    food_name: str
    calories: Optional[float] = None # Calories field is now optional

# Pydantic model for the response body when reading or creating a Calorie Entry
class CalorieEntryResponse(BaseModel):
    id: int
    food_name: str
    calories: float
    # This field is expected to be a string in the response model
    consumed_at: str

    class Config:
        orm_mode = True # Enables Pydantic to read data directly from SQLAlchemy models

# Dependency function to get a database session
# This ensures a session is created for each request and closed afterwards.
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

## API Endpoints

# Endpoint to get food suggestions for autocomplete in the frontend
from typing import Any
@app.get("/food-suggestions/", response_model=Dict[str, Dict[str, Any]])
def get_food_suggestions():
    """
    Returns a dictionary of food names and their calorie/unit info for suggestions in the frontend.
    """
    return food_data.FOOD_CALORIES

# Root endpoint for a simple health check or welcome message
@app.get("/")
def read_root():
    """
    Returns a simple message to confirm the API is running.
    """
    return {"message": "Hello from FastAPI with Database!"}

# Endpoint to create a new calorie entry
@app.post("/entries/", response_model=CalorieEntryResponse)
def create_calorie_entry(entry: CalorieEntryCreate, db: Session = Depends(get_db)):
    """
    Creates a new calorie entry in the database.
    If calories are not provided, attempts to auto-calculate from `food_data`.
    """
    final_calories: float

    # If calories were not manually provided by the user
    if entry.calories is None:
        # Try to find calories from the predefined food_data list
        auto_calculated_calories = food_data.get_calories_by_food_name(entry.food_name)

        if auto_calculated_calories is None:
            # If calories could not be found and user didn't provide them, raise an error
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, # Use status.HTTP_400_BAD_REQUEST
                detail="Calories not provided and food name not found in database. Please provide calories manually."
            )
        else:
            # If auto-calculated calories were found, use them
            final_calories = auto_calculated_calories
    else:
        # If calories were manually provided, use the user's input
        final_calories = entry.calories

    # Create a new CalorieEntry model instance
    db_entry = models.CalorieEntry(food_name=entry.food_name, calories=final_calories)
    db.add(db_entry)  # Add the new entry object to the session
    db.commit()       # Commit the transaction to save to the database
    db.refresh(db_entry) # Refresh the object to get any database-generated values (like 'id', 'consumed_at')

    # Explicitly convert consumed_at to string before returning
    # This ensures Pydantic receives a string, bypassing potential serialization issues.
    db_entry.consumed_at = db_entry.consumed_at.isoformat()

    return db_entry

# NEW ENDPOINT: Delete a calorie entry
@app.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT) # 204 No Content for successful deletion
def delete_calorie_entry(entry_id: int, db: Session = Depends(get_db)):
    """
    Deletes a calorie entry by its ID.
    Returns 204 No Content on successful deletion, 404 if not found.
    """
    db_entry = db.query(models.CalorieEntry).filter(models.CalorieEntry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found") # Use status.HTTP_404_NOT_FOUND
    
    db.delete(db_entry)
    db.commit()
    return {"message": "Entry deleted successfully"} # This return is technically ignored for 204, but good practice.

# Endpoint to retrieve all calorie entries
@app.get("/entries/", response_model=list[CalorieEntryResponse])
def read_calorie_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of all calorie entries from the database.
    Supports basic pagination with `skip` and `limit` parameters.
    """
    entries = db.query(models.CalorieEntry).offset(skip).limit(limit).all()
    
    # Explicitly convert consumed_at to string for each entry
    # This is needed for the list of entries as well to match the Pydantic response model.
    for entry in entries:
        entry.consumed_at = entry.consumed_at.isoformat()

    return entries