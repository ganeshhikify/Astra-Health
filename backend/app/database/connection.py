"""
Database connection, session management, and connectivity diagnostics.
"""

from typing import Generator, Tuple
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Create SQLAlchemy engine with connection pool
# pool_pre_ping checks connection health before issuing queries
engine = create_engine(
    settings.database_url,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_pre_ping=True,
)

# Configured session factory for database operations
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session.
    Automatically closes session after request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> Tuple[bool, str]:
    """
    Actively checks PostgreSQL connection by executing a lightweight query.
    Returns:
        (True, "Database connection verified") if connected.
        (False, error_message) if unavailable, without crashing the app.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Database connection verified"
    except Exception as exc:
        return False, f"Database unavailable: {str(exc)}"
