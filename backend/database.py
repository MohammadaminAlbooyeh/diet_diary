# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database URL. The database file 'sql_app.db' will be created here.
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# The Engine is responsible for connecting to the database.
# 'connect_args={"check_same_thread": False}' is only necessary for SQLite.
# This allows concurrent requests (from a single thread) to interact with the database.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal is a class for creating database sessions.
# Each instance of SessionLocal is a database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the class that our database models will inherit from.
# This class tells SQLAlchemy that any model inheriting from it is a database model.
Base = declarative_base()

# This function is used to manage database sessions in FastAPI (Dependency Injection).
# It creates a session and ensures it's closed afterward.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Add this at the end of the file to create tables in the database
if __name__ == "__main__":
    from models import CalorieEntry  # Import all models here
    Base.metadata.create_all(engine)