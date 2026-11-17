from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from server.app.config import get_db_url

db_url = get_db_url()

connect_args = {}
engine_kwargs = {"future": True}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # PostgreSQL / Supabase pool configuration
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(db_url, connect_args=connect_args, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
