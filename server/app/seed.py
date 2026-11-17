from datetime import date, timedelta
from server.app.database import SessionLocal, engine, Base
from server.app.models.user import User
from server.app.models.member import Member
from server.app.models.book import Book
from server.app.models.loan import Loan
from server.app.security import hash_password
from server.app.config import settings

def seed_database():
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Administrator User (FR-01)
        admin = db.query(User).filter(User.username == settings.ADMIN_DEFAULT_USERNAME).first()
        if not admin:
            admin = User(
                username=settings.ADMIN_DEFAULT_USERNAME,
                password_hash=hash_password(settings.ADMIN_DEFAULT_PASSWORD),
                role="ADMIN",
                member_id=None
            )
            db.add(admin)
            print(f"Created default admin account: '{settings.ADMIN_DEFAULT_USERNAME}'")
        else:
            print(f"Admin account '{settings.ADMIN_DEFAULT_USERNAME}' already exists.")

        # 2. Seed Sample Members
        sample_members_data = [
            ("Alice Walker", "alice.walker@university.edu", "+1-555-0101", date.today() - timedelta(days=60)),
            ("Bob Martinez", "bob.martinez@university.edu", "+1-555-0102", date.today() - timedelta(days=45)),
            ("Carol Danvers", "carol.danvers@university.edu", "+1-555-0103", date.today() - timedelta(days=30)),
            ("David Kim", "david.kim@university.edu", "+1-555-0104", date.today() - timedelta(days=15)),
            ("Emma Watson", "emma.watson@university.edu", "+1-555-0105", date.today() - timedelta(days=5)),
        ]

        created_members = []
        for name, email, phone, reg_date in sample_members_data:
            m = db.query(Member).filter(Member.email == email).first()
            if not m:
                m = Member(
                    full_name=name,
                    email=email,
                    phone=phone,
                    registration_date=reg_date
                )
                db.add(m)
                db.flush()

                # Also create a login account for this member
                username = email.split("@")[0]
                u = db.query(User).filter(User.username == username).first()
                if not u:
                    u = User(
                        username=username,
                        password_hash=hash_password("Member123!"),
                        role="MEMBER",
                        member_id=m.member_id
                    )
                    db.add(u)
            created_members.append(m)
        db.commit()
        print(f"Seeded {len(created_members)} members and their login accounts (password: 'Member123!').")

        # 3. Seed Sample Books across diverse academic categories
        sample_books_data = [
            ("Introduction to Algorithms (CLRS)", "Thomas H. Cormen et al.", "Computer Science", "978-0262033848", 5),
            ("Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", "Software Engineering", "978-0132350884", 4),
            ("Database System Concepts", "Abraham Silberschatz et al.", "Computer Science", "978-0073523323", 3),
            ("Design Patterns: Elements of Reusable Object-Oriented Software", "Erich Gamma et al.", "Software Engineering", "978-0201633610", 3),
            ("Artificial Intelligence: A Modern Approach", "Stuart Russell, Peter Norvig", "Artificial Intelligence", "978-0136042594", 4),
            ("Computer Networking: A Top-Down Approach", "James Kurose, Keith Ross", "Computer Science", "978-0133594140", 2),
            ("Operating System Concepts", "Abraham Silberschatz, Peter Galvin", "Computer Science", "978-1118063330", 3),
            ("Discrete Mathematics and Its Applications", "Kenneth Rosen", "Mathematics", "978-0073383095", 4),
            ("Deep Learning", "Ian Goodfellow, Yoshua Bengio", "Artificial Intelligence", "978-0262035613", 2),
            ("Quantum Computing: An Applied Approach", "Jack D. Hidary", "Physics", "978-3030239220", 1),
        ]

        created_books = []
        for title, author, cat, isbn, copies in sample_books_data:
            b = db.query(Book).filter(Book.isbn == isbn).first()
            if not b:
                b = Book(
                    title=title,
                    author=author,
                    category=cat,
                    isbn=isbn,
                    total_copies=copies,
                    available_copies=copies
                )
                db.add(b)
                db.flush()
            created_books.append(b)
        db.commit()
        print(f"Seeded {len(created_books)} academic books.")

        # 4. Seed Representative Loans (Returned, Currently Borrowed, Overdue)
        # Only seed if no loans currently exist
        existing_loans_count = db.query(Loan).count()
        if existing_loans_count == 0 and len(created_members) >= 4 and len(created_books) >= 4:
            m1, m2, m3, m4 = created_members[0], created_members[1], created_members[2], created_members[3]
            b1, b2, b3, b4 = created_books[0], created_books[1], created_books[2], created_books[3]

            # Loan 1: Returned on time
            l1 = Loan(
                member_id=m1.member_id,
                book_id=b1.book_id,
                borrowed_at=date.today() - timedelta(days=20),
                due_date=date.today() - timedelta(days=6),
                returned_at=date.today() - timedelta(days=8)
            )
            db.add(l1)

            # Loan 2: Currently Borrowed (due in 5 days)
            l2 = Loan(
                member_id=m2.member_id,
                book_id=b2.book_id,
                borrowed_at=date.today() - timedelta(days=5),
                due_date=date.today() + timedelta(days=9),
                returned_at=None
            )
            db.add(l2)
            b2.available_copies -= 1

            # Loan 3: Overdue (due 4 days ago, not returned)
            l3 = Loan(
                member_id=m3.member_id,
                book_id=b3.book_id,
                borrowed_at=date.today() - timedelta(days=18),
                due_date=date.today() - timedelta(days=4),
                returned_at=None
            )
            db.add(l3)
            b3.available_copies -= 1

            # Loan 4: Another active loan for m1
            l4 = Loan(
                member_id=m1.member_id,
                book_id=b4.book_id,
                borrowed_at=date.today() - timedelta(days=3),
                due_date=date.today() + timedelta(days=11),
                returned_at=None
            )
            db.add(l4)
            b4.available_copies -= 1

            db.commit()
            print("Seeded 4 loans (1 Returned, 2 Active Borrowed, 1 Overdue).")
        else:
            print("Loans already exist, skipping loan seed.")

        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
