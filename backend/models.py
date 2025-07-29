# backend/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base # FIXED: Changed from relative to absolute import

class CalorieEntry(Base):
    __tablename__ = "calorie_entries" # The name of the table that will be created in the database

    id = Column(Integer, primary_key=True, index=True)
    food_name = Column(String, index=True)
    calories = Column(Float)
    consumed_at = Column(DateTime, default=func.now()) # Date and time of entry