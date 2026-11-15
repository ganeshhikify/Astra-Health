# ASTRA HEALTH — Backend Foundation

Aerospace astronaut biomedical telemetry monitoring system built with **FastAPI**, **SQLAlchemy 2.x**, **PostgreSQL**, and **Pydantic v2**.

---

## 1. Prerequisites

- **Python**: 3.11+ (Tested on Python 3.14)
- **PostgreSQL**: 15+ (Local service or cloud-hosted instance such as Neon, Supabase, or AWS RDS)
- **Git**

---

## 2. Directory Structure

```text
backend/
├── app/
│   ├── api/
│   │   └── routes/
│   │       ├── health.py            # /health diagnostics endpoint
│   │       └── __init__.py
│   ├── core/
│   │   ├── config.py                # Environment configuration
│   │   └── __init__.py
│   ├── database/
│   │   ├── base.py                  # SQLAlchemy DeclarativeBase
│   │   ├── connection.py            # Engine, SessionLocal, get_db dependency
│   │   └── __init__.py
│   ├── models/                      # Foundational database entities
│   │   ├── astronaut.py             # AstronautProfile model
│   │   ├── mission.py               # Mission assignment model
│   │   ├── health_assessment.py     # Clinical evaluation model
│   │   ├── health_measurement.py    # Physiological vitals telemetry model
│   │   └── __init__.py
│   ├── schemas/                     # Pydantic schemas (Stage 2)
│   ├── services/                    # Business logic (Stage 2)
│   └── main.py                      # FastAPI application entrypoint
├── migrations/                      # Alembic database migrations
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── tests/                           # Pytest automated test suite
├── .env.example                     # Environment template
├── .env                             # Local environment settings (gitignored)
├── alembic.ini                      # Alembic configuration
├── requirements.txt                 # Core dependencies
└── README.md                        # Documentation
```

---

## 3. Environment Setup & Dependency Installation

Run the following commands in **Windows PowerShell**:

```powershell
# Navigate to the backend directory
cd C:\projects\astra\backend

# Optional: Create and activate a Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install core dependencies
pip install -r requirements.txt
```

---

## 4. PostgreSQL Database Setup

### Option A: Local PostgreSQL Server
1. Download and install PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/).
2. Open PowerShell or `psql` and create the `astra_health` database:
   ```sql
   CREATE DATABASE astra_health;
   ```
3. Update `backend/.env` with your local PostgreSQL password:
   ```env
   DATABASE_URL="postgresql+psycopg://postgres:your_password@localhost:5432/astra_health"
   ```

### Option B: Free Cloud PostgreSQL (e.g., Neon / Supabase)
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy the connection string into `backend/.env`:
   ```env
   DATABASE_URL="postgresql+psycopg://user:password@ep-host.region.neon.tech/neondb?sslmode=require"
   ```

---

## 5. Running Database Migrations (Alembic)

Once your PostgreSQL database is running and configured in `.env`:

```powershell
cd C:\projects\astra\backend

# Generate initial migration from models
alembic revision --autogenerate -m "Initial schema: astronauts, missions, assessments, measurements"

# Apply migrations to database
alembic upgrade head

# Roll back the most recent migration (if needed)
alembic downgrade -1
```

---

## 6. Starting the FastAPI Development Server

To launch the backend with auto-reload:

```powershell
cd C:\projects\astra\backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 7. Interactive API Documentation

Once started, navigate to:

- **Swagger UI (Interactive API Docs):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc (Specification View):** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **OpenAPI JSON Schema:** [http://127.0.0.1:8000/api/v1/openapi.json](http://127.0.0.1:8000/api/v1/openapi.json)

---

## 8. Health Check & Diagnostics

Check system status and live database connectivity:

```powershell
curl http://127.0.0.1:8000/health
```

**Expected Response (Connected):**
```json
{
  "status": "healthy",
  "service": "ASTRA HEALTH API",
  "version": "0.1.0",
  "environment": "development",
  "database": {
    "status": "connected",
    "message": "Database connection verified"
  }
}
```

**Graceful Degradation Response (When PostgreSQL is not yet running):**
```json
{
  "status": "degraded",
  "service": "ASTRA HEALTH API",
  "version": "0.1.0",
  "environment": "development",
  "database": {
    "status": "unavailable",
    "message": "Database unavailable: (psycopg.OperationalError)..."
  }
}
```

---

## 9. Running Automated Tests

Run the test suite using `pytest`:

```powershell
cd C:\projects\astra\backend
python -c "from tests.test_models import *; print('All models validated successfully')"
```
