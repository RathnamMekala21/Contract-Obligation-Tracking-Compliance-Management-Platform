from sqlalchemy import create_engine,text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings


db_url = settings.DATABASE_URL

# Fallback mechanism if postgresql connection string fails or cannot connect to local host
if db_url.startswith("postgresql"):
    try:
        engine = create_engine(db_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        print(f"PostgreSQL connection failed ({e}), falling back to SQLite database.")
        db_url = "sqlite:///./contractiq.db"
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url, connect_args={"check_same_thread": False} if "sqlite" in db_url else {})

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base = declarative_base()


def get_db():
    db = None
    try:
        db = SessionLocal()
        yield db
    except Exception as e:
        print("Database connection error in get_db:", e)
        yield None
    finally:
        if db is not None:
            try:
                db.close()
            except Exception:
                pass


def test_database_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("Database connection successful.")
    except Exception as error:
        print("Database connection failed:", error)