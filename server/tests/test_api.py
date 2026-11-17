import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from server.app.database import Base, get_db
from server.app.main import app
from server.app.models.user import User
from server.app.models.book import Book
from server.app.models.member import Member
from server.app.models.loan import Loan
from server.app.security import hash_password

# Use StaticPool with SQLite in-memory so all threads/sessions share the same DB in tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create Admin
    admin = User(
        username="admin",
        password_hash=hash_password("Admin123!"),
        role="ADMIN",
        member_id=None
    )
    db.add(admin)

    # Create Member 1
    m1 = Member(
        full_name="Alice Test",
        email="alice@test.edu",
        phone="1234567890",
        registration_date=date.today() - timedelta(days=10)
    )
    db.add(m1)
    db.flush()

    u1 = User(
        username="alice",
        password_hash=hash_password("Member123!"),
        role="MEMBER",
        member_id=m1.member_id
    )
    db.add(u1)

    # Create Member 2
    m2 = Member(
        full_name="Bob Test",
        email="bob@test.edu",
        phone="0987654321",
        registration_date=date.today() - timedelta(days=5)
    )
    db.add(m2)
    db.flush()

    u2 = User(
        username="bob",
        password_hash=hash_password("Member123!"),
        role="MEMBER",
        member_id=m2.member_id
    )
    db.add(u2)

    # Create Books
    b1 = Book(
        title="Python Programming",
        author="Guido van Rossum",
        category="Computer Science",
        isbn="978-1111111111",
        total_copies=2,
        available_copies=2
    )
    b2 = Book(
        title="Web Architecture",
        author="Roy Fielding",
        category="Software Engineering",
        isbn="978-2222222222",
        total_copies=1,
        available_copies=1
    )
    db.add_all([b1, b2])
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)

def get_admin_token():
    res = client.post("/api/auth/login", json={"username": "admin", "password": "Admin123!"})
    assert res.status_code == 200
    return res.json()["data"]["access_token"]

def get_member_token(username="alice", password="Member123!"):
    res = client.post("/api/auth/login", json={"username": username, "password": password})
    assert res.status_code == 200
    return res.json()["data"]["access_token"]

# --- Authentication Tests (TC-01, TC-02, TC-03, TC-04) ---
def test_tc01_login_valid_admin():
    res = client.post("/api/auth/login", json={"username": "admin", "password": "Admin123!"})
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["user"]["role"] == "ADMIN"
    assert "access_token" in data

def test_tc02_login_invalid_credentials():
    res = client.post("/api/auth/login", json={"username": "admin", "password": "WrongPassword"})
    assert res.status_code == 401
    assert "Invalid username or password" in res.json()["message"]

def test_tc03_admin_route_unauthenticated():
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 401

def test_tc04_member_attempts_admin_api():
    token = get_member_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/dashboard/summary", headers=headers)
    assert res.status_code == 403
    assert "Administrator access required" in res.json()["message"]

# --- Book Management Tests (TC-05 through TC-10) ---
def test_tc05_add_valid_book():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Clean Architecture",
        "author": "Robert C. Martin",
        "category": "Software Engineering",
        "isbn": "978-0134494166",
        "total_copies": 3
    }
    res = client.post("/api/books", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()["data"]
    assert data["title"] == "Clean Architecture"
    assert data["available_copies"] == 3
    assert data["borrowed_copies"] == 0

def test_tc06_add_book_missing_fields():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/books", json={"title": ""}, headers=headers)
    assert res.status_code == 400

def test_tc07_add_duplicate_isbn():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Another Python Book",
        "author": "Another Author",
        "category": "Tech",
        "isbn": "978-1111111111",  # Same as b1
        "total_copies": 2
    }
    res = client.post("/api/books", json=payload, headers=headers)
    assert res.status_code == 409
    assert "already exists" in res.json()["message"]

def test_tc08_update_book():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.put("/api/books/1", json={"title": "Python Programming 2nd Edition"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["data"]["title"] == "Python Programming 2nd Edition"

def test_tc09_delete_book_without_loans():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.delete("/api/books/1", headers=headers)
    assert res.status_code == 200
    # Confirm it's gone
    res_get = client.get("/api/books/1", headers=headers)
    assert res_get.status_code == 404

def test_tc10_delete_book_with_active_loan():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    # Borrow book 1 first
    borrow_res = client.post("/api/loans", json={
        "member_id": 1,
        "book_id": 1,
        "due_date": str(date.today() + timedelta(days=7))
    }, headers=headers)
    assert borrow_res.status_code == 201

    # Attempt delete
    del_res = client.delete("/api/books/1", headers=headers)
    assert del_res.status_code == 409
    assert "active loan" in del_res.json()["message"]

# --- Member Management Tests (TC-11 through TC-14) ---
def test_tc11_register_valid_member():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "full_name": "Charlie Chaplin",
        "email": "charlie@university.edu",
        "phone": "555-1234",
        "registration_date": str(date.today())
    }
    res = client.post("/api/members", json=payload, headers=headers)
    assert res.status_code == 201
    assert res.json()["data"]["full_name"] == "Charlie Chaplin"

def test_tc12_register_duplicate_email():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "full_name": "Alice Duplicate",
        "email": "alice@test.edu",  # Duplicate email
        "phone": "555-9999",
        "registration_date": str(date.today())
    }
    res = client.post("/api/members", json=payload, headers=headers)
    assert res.status_code == 409
    assert "already exists" in res.json()["message"]

def test_tc13_update_member():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.put("/api/members/1", json={"full_name": "Alice Wonderland"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["data"]["full_name"] == "Alice Wonderland"

def test_tc14_remove_member_with_active_loan():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    # Borrow book for member 1
    client.post("/api/loans", json={
        "member_id": 1,
        "book_id": 1,
        "due_date": str(date.today() + timedelta(days=7))
    }, headers=headers)

    # Attempt to delete member 1
    del_res = client.delete("/api/members/1", headers=headers)
    assert del_res.status_code == 409
    assert "active book loan" in del_res.json()["message"]

# --- Catalogue Search Tests (TC-15, TC-16) ---
def test_tc15_search_by_title():
    token = get_member_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/books?title=Python", headers=headers)
    assert res.status_code == 200
    books = res.json()["data"]
    assert len(books) == 1
    assert "Python" in books[0]["title"]

def test_tc16_search_by_author():
    token = get_member_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/books?author=Fielding", headers=headers)
    assert res.status_code == 200
    books = res.json()["data"]
    assert len(books) == 1
    assert "Roy Fielding" in books[0]["author"]

# --- Borrowing Workflow Tests (TC-17, TC-18, TC-19) ---
def test_tc17_borrow_book_with_available_copies():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.post("/api/loans", json={
        "member_id": 1,
        "book_id": 1,
        "due_date": str(date.today() + timedelta(days=14))
    }, headers=headers)
    assert res.status_code == 201
    loan = res.json()["data"]
    assert loan["status"] == "BORROWED"

    # Verify book availability decreased by 1
    book_res = client.get("/api/books/1", headers=headers)
    assert book_res.json()["data"]["available_copies"] == 1
    assert book_res.json()["data"]["borrowed_copies"] == 1

def test_tc18_borrow_book_with_zero_copies():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    # Book 2 has 1 copy. Borrow it first.
    client.post("/api/loans", json={
        "member_id": 1,
        "book_id": 2,
        "due_date": str(date.today() + timedelta(days=7))
    }, headers=headers)

    # Try to borrow it again
    second_borrow = client.post("/api/loans", json={
        "member_id": 2,
        "book_id": 2,
        "due_date": str(date.today() + timedelta(days=7))
    }, headers=headers)
    assert second_borrow.status_code == 409
    assert "No copies available" in second_borrow.json()["message"]

# --- Return and Overdue Workflow Tests (TC-20, TC-21, TC-22, TC-23) ---
def test_tc20_return_active_loan():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    borrow_res = client.post("/api/loans", json={
        "member_id": 1,
        "book_id": 2,
        "due_date": str(date.today() + timedelta(days=7))
    }, headers=headers)
    loan_id = borrow_res.json()["data"]["loan_id"]

    return_res = client.patch(f"/api/loans/{loan_id}/return", headers=headers)
    assert return_res.status_code == 200
    assert return_res.json()["data"]["status"] == "RETURNED"

    # Verify copy increment
    book_res = client.get("/api/books/2", headers=headers)
    assert book_res.json()["data"]["available_copies"] == 1

def test_tc21_return_same_loan_twice():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    borrow_res = client.post("/api/loans", json={
        "member_id": 1,
        "book_id": 2,
        "due_date": str(date.today() + timedelta(days=7))
    }, headers=headers)
    loan_id = borrow_res.json()["data"]["loan_id"]

    # First return
    client.patch(f"/api/loans/{loan_id}/return", headers=headers)

    # Second return attempt
    second_res = client.patch(f"/api/loans/{loan_id}/return", headers=headers)
    assert second_res.status_code == 400
    assert "already been returned" in second_res.json()["message"]

def test_tc22_and_tc23_overdue_and_return():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Directly inject an overdue loan into DB
    db = TestingSessionLocal()
    overdue_loan = Loan(
        member_id=1,
        book_id=1,
        borrowed_at=date.today() - timedelta(days=20),
        due_date=date.today() - timedelta(days=5),
        returned_at=None
    )
    db.add(overdue_loan)
    b1 = db.query(Book).filter(Book.book_id == 1).first()
    b1.available_copies -= 1
    db.commit()
    loan_id = overdue_loan.loan_id
    db.close()

    # TC-22: Verify it shows up in overdue list
    overdue_res = client.get("/api/loans/overdue", headers=headers)
    assert overdue_res.status_code == 200
    overdue_list = overdue_res.json()["data"]
    assert any(l["loan_id"] == loan_id for l in overdue_list)

    # TC-23: Return the overdue loan
    return_res = client.patch(f"/api/loans/{loan_id}/return", headers=headers)
    assert return_res.status_code == 200
    assert return_res.json()["data"]["status"] == "RETURNED"

    # Verify no longer in overdue list
    overdue_res_after = client.get("/api/loans/overdue", headers=headers)
    assert not any(l["loan_id"] == loan_id for l in overdue_res_after.json()["data"])

# --- Member History Tests (TC-24, TC-25) ---
def test_tc24_member_views_own_history():
    admin_token = get_admin_token()
    # Create loan for Alice (member 1)
    client.post("/api/loans", json={
        "member_id": 1,
        "book_id": 1,
        "due_date": str(date.today() + timedelta(days=7))
    }, headers={"Authorization": f"Bearer {admin_token}"})

    alice_token = get_member_token("alice")
    res = client.get("/api/members/me/loans", headers={"Authorization": f"Bearer {alice_token}"})
    assert res.status_code == 200
    loans = res.json()["data"]
    assert len(loans) == 1
    assert loans[0]["member_id"] == 1
    assert loans[0]["book"]["title"] == "Python Programming"

def test_tc25_member_cannot_see_other_member_history():
    # Bob (member 2) checks his history - should be empty, not showing Alice's loan
    bob_token = get_member_token("bob")
    res = client.get("/api/members/me/loans", headers={"Authorization": f"Bearer {bob_token}"})
    assert res.status_code == 200
    assert len(res.json()["data"]) == 0

# --- Dashboard Counts Test (TC-26) ---
def test_tc26_dashboard_summary_counts():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/dashboard/summary", headers=headers)
    assert res.status_code == 200
    counts = res.json()["data"]
    assert counts["total_books"] == 2
    assert counts["total_members"] == 2
    assert counts["currently_borrowed"] == 0
    assert counts["overdue_loans"] == 0
