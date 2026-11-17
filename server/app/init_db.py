from server.app.database import engine, Base
from server.app.models import user, member, book, loan
from server.app.seed import seed_database

def init_all():
    print("Creating all tables in database...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
    print("Running initial seed...")
    seed_database()
    print("Database initialization complete.")

if __name__ == "__main__":
    init_all()
