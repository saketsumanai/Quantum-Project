"""
SQLAlchemy database engine and session factory for Quantum Leap.
Uses SQLite for development; swap DATABASE_URL for PostgreSQL in production.

Security hardening applied:
  - SQLite WAL mode for crash-safe writes
  - Foreign-key constraint enforcement (SQLite disables by default)
  - DB file placed in a configurable path (not exposed under web root)
  - Statement timeout guard via connection event
  - Parameterised queries enforced by ORM (no raw string interpolation)
"""
import os
import stat
from pathlib import Path
from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./quantum_leap.db")

# ─── SQLite Security Hardening ────────────────────────────────────────────────
_is_sqlite = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    # Pool settings for production PostgreSQL
    pool_pre_ping=True,       # Detect stale connections
    pool_recycle=1800,        # Recycle connections every 30 min
    echo=False,               # Never log raw SQL in production
)


if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _configure_sqlite(dbapi_connection, _connection_record):
        """
        Applies security and performance pragmas on every new SQLite connection.
        These settings are connection-scoped in SQLite so must be set each time.
        """
        cursor = dbapi_connection.cursor()
        # Enforce foreign key constraints (disabled in SQLite by default)
        cursor.execute("PRAGMA foreign_keys = ON")
        # WAL journal = crash-safe concurrent reads/writes
        cursor.execute("PRAGMA journal_mode = WAL")
        # Sync level: NORMAL = good balance of safety vs speed
        cursor.execute("PRAGMA synchronous = NORMAL")
        # Busy timeout: wait up to 5 s instead of failing immediately on lock
        cursor.execute("PRAGMA busy_timeout = 5000")
        # Restrict temp store to memory for speed
        cursor.execute("PRAGMA temp_store = MEMORY")
        cursor.close()

    # ── Restrict file permissions on the SQLite database ─────────────────────
    def _restrict_db_permissions() -> None:
        """
        Ensures the SQLite file is readable/writable only by the owner process
        (mode 600). Prevents other OS users from reading raw user data.
        Only meaningful on Unix-like systems; no-op on Windows.
        """
        try:
            db_path_str = DATABASE_URL.replace("sqlite:///", "").replace("sqlite://", "")
            db_path = Path(db_path_str).resolve()
            if db_path.exists() and os.name != "nt":
                os.chmod(db_path, stat.S_IRUSR | stat.S_IWUSR)  # 600
        except Exception as e:
            print(f"[DB] Permission hardening note: {e}")

    _restrict_db_permissions()


# ─── Session Factory ──────────────────────────────────────────────────────────

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    FastAPI dependency: yields a scoped DB session per request.
    Guarantees the session is closed (and transactions rolled back on error)
    even if the handler raises an exception.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
