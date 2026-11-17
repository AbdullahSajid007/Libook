"""
Generate professional visual diagram PNGs for all system diagrams:
1. use-case-diagram.png
2. activity-admin-login.png
3. activity-add-book.png
4. activity-register-member.png
5. activity-borrow-book.png
6. activity-return-book.png
7. activity-search-catalogue.png
8. activity-view-member-history.png
9. dfd-level-0.png
10. dfd-level-1.png
11. class-diagram.png
12. er-diagram.png
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_font(size=14, bold=False):
    try:
        font_name = "arialbd.ttf" if bold else "arial.ttf"
        return ImageFont.truetype(font_name, size)
    except Exception:
        return ImageFont.load_default()

def draw_header(draw, title, subtitle, width):
    draw.rectangle([0, 0, width, 65], fill="#1e293b")
    font_title = get_font(20, bold=True)
    font_sub = get_font(12, bold=False)
    draw.text((25, 12), title, fill="#ffffff", font=font_title)
    draw.text((25, 40), subtitle, fill="#94a3b8", font=font_sub)

def create_card(draw, x, y, w, h, title, items, fill="#ffffff", stroke="#cbd5e1", title_fill="#0f172a"):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=8, fill=fill, outline=stroke, width=2)
    font_t = get_font(14, bold=True)
    font_i = get_font(12, bold=False)
    draw.text((x + 14, y + 10), title, fill=title_fill, font=font_t)
    draw.line([x, y + 32, x + w, y + 32], fill=stroke, width=1)
    cy = y + 42
    for item in items:
        draw.text((x + 14, cy), item, fill="#334155", font=font_i)
        cy += 20

def create_step(draw, x, y, step_no, text, status="step", w=240, h=45):
    colors = {
        "start": ("#0284c7", "#e0f2fe", "#0369a1"),
        "step": ("#475569", "#f8fafc", "#cbd5e1"),
        "decision": ("#d97706", "#fef3c7", "#f59e0b"),
        "success": ("#16a34a", "#dcfce7", "#86efac"),
        "error": ("#dc2626", "#fee2e2", "#fca5a5"),
        "db": ("#7c3aed", "#f3e8ff", "#d8b4fe")
    }
    tc, bg, bd = colors.get(status, colors["step"])
    draw.rounded_rectangle([x, y, x + w, y + h], radius=6, fill=bg, outline=bd, width=2)
    font_num = get_font(11, bold=True)
    font_txt = get_font(12, bold=False)
    if step_no:
        draw.text((x + 10, y + 6), f"[{step_no}]", fill=tc, font=font_num)
        draw.text((x + 10, y + 22), text, fill="#1e293b", font=font_txt)
    else:
        draw.text((x + 10, y + 14), text, fill=tc, font=font_txt)

def draw_arrow_down(draw, x, y1, y2, color="#64748b", text=""):
    draw.line([x, y1, x, y2], fill=color, width=2)
    draw.polygon([(x - 4, y2 - 6), (x + 4, y2 - 6), (x, y2)], fill=color)
    if text:
        font = get_font(10, bold=False)
        draw.text((x + 8, (y1 + y2) // 2 - 6), text, fill=color, font=font)

def draw_arrow_right(draw, x1, y, x2, color="#64748b", text=""):
    draw.line([x1, y, x2, y], fill=color, width=2)
    draw.polygon([(x2 - 6, y - 4), (x2 - 6, y + 4), (x2, y)], fill=color)
    if text:
        font = get_font(10, bold=False)
        draw.text(((x1 + x2) // 2 - 15, y - 16), text, fill=color, font=font)

# 1. Use Case Diagram
def gen_use_case():
    w, h = 950, 620
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Use Case Diagram", "University Library Management System - Actors & Scope", w)

    # Actors
    create_card(d, 40, 100, 220, 210, "👨‍💼 Librarian / Admin", [
        "Authenticated staff user",
        "- Manages book records",
        "- Manages member records",
        "- Creates & returns loans",
        "- Monitors overdue loans",
        "- Views executive dashboard"
    ], fill="#eff6ff", stroke="#93c5fd", title_fill="#1e40af")

    create_card(d, 40, 360, 220, 180, "🎓 Registered Member", [
        "Library student/faculty",
        "- Logs in to LMS",
        "- Browses catalogue",
        "- Searches by title/author",
        "- Views own loan history",
        "- Checks return due dates"
    ], fill="#f0fdf4", stroke="#86efac", title_fill="#166534")

    # LMS Boundary
    d.rounded_rectangle([320, 85, 910, 580], radius=12, fill="#ffffff", outline="#6366f1", width=2)
    d.text((340, 95), "SYSTEM BOUNDARY: Library Management System (LMS)", fill="#4338ca", font=get_font(14, bold=True))

    use_cases = [
        ("UC-01: Login & Secure Logout", 130, True, True),
        ("UC-02: View Executive Dashboard", 175, True, False),
        ("UC-03: Manage Books (CRUD, Copies)", 220, True, False),
        ("UC-04: Manage Members (Register, CRUD)", 265, True, False),
        ("UC-05: Create Borrowing Record (Atomic)", 310, True, False),
        ("UC-06: Process Book Return (Atomic)", 355, True, False),
        ("UC-07: Track Overdue Loans", 400, True, False),
        ("UC-08: Browse & Search Catalogue", 445, True, True),
        ("UC-09: View Own Borrowing History", 490, False, True),
    ]

    for title, cy, by_admin, by_member in use_cases:
        d.rounded_rectangle([360, cy, 870, cy + 34], radius=17, fill="#f1f5f9", outline="#cbd5e1", width=1)
        d.text((400, cy + 8), title, fill="#0f172a", font=get_font(12, bold=True))
        if by_admin:
            d.line([260, 205, 360, cy + 17], fill="#3b82f6", width=2)
        if by_member:
            d.line([260, 450, 360, cy + 17], fill="#22c55e", width=2)

    im.save(os.path.join(OUTPUT_DIR, "use-case-diagram.png"))

# 2. Activity Diagrams (7 workflows)
def gen_activity_admin_login():
    w, h = 650, 560
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Activity Diagram: Authentication", "Admin and Member Login Workflow", w)
    
    steps = [
        (220, 85, "1", "User inputs username & password", "start"),
        (220, 155, "2", "Send POST /api/auth/login", "step"),
        (220, 225, "3", "Verify bcrypt hash in database", "db"),
        (220, 305, "4", "Are credentials valid?", "decision"),
        (220, 385, "5", "Generate signed JWT token", "success"),
        (220, 465, "6", "Redirect based on role (ADMIN/MEMBER)", "step")
    ]
    for x, y, no, txt, st in steps:
        create_step(d, x, y, no, txt, st)

    create_step(d, 480, 305, "ERR", "Return 401 Invalid Credentials", "error")
    
    draw_arrow_down(d, 340, 130, 155)
    draw_arrow_down(d, 340, 200, 225)
    draw_arrow_down(d, 340, 270, 305)
    draw_arrow_down(d, 340, 350, 385, text="Yes")
    draw_arrow_right(d, 460, 327, 480, text="No")
    draw_arrow_down(d, 340, 430, 465)

    im.save(os.path.join(OUTPUT_DIR, "activity-admin-login.png"))

def gen_activity_add_book():
    w, h = 650, 580
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Activity Diagram: Add Book", "Book Registration & Validation Flow", w)

    create_step(d, 200, 85, "1", "Librarian fills Title, Author, ISBN, Copies", "start")
    create_step(d, 200, 155, "2", "Client & Server Validation (total_copies >= 0)", "step")
    create_step(d, 200, 230, "3", "Does ISBN already exist?", "decision")
    create_step(d, 200, 315, "4", "Set available_copies = total_copies", "step")
    create_step(d, 200, 395, "5", "Persist Book record to PostgreSQL", "db")
    create_step(d, 200, 475, "6", "Return 201 Created & refresh UI list", "success")

    create_step(d, 460, 230, "ERR", "Return 409 Conflict (Duplicate ISBN)", "error")

    draw_arrow_down(d, 320, 130, 155)
    draw_arrow_down(d, 320, 200, 230)
    draw_arrow_down(d, 320, 275, 315, text="No")
    draw_arrow_right(d, 440, 252, 460, text="Yes")
    draw_arrow_down(d, 320, 360, 395)
    draw_arrow_down(d, 320, 440, 475)

    im.save(os.path.join(OUTPUT_DIR, "activity-add-book.png"))

def gen_activity_register_member():
    w, h = 650, 580
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Activity Diagram: Register Member", "Member Registration & Uniqueness Check", w)

    create_step(d, 200, 85, "1", "Librarian enters Name, Email, Phone, Reg Date", "start")
    create_step(d, 200, 155, "2", "Validate email format & phone", "step")
    create_step(d, 200, 230, "3", "Is member email already in database?", "decision")
    create_step(d, 200, 315, "4", "Insert Member & generate unique ID", "step")
    create_step(d, 200, 395, "5", "Commit transaction in PostgreSQL", "db")
    create_step(d, 200, 475, "6", "Return 201 Created & show in Members table", "success")

    create_step(d, 460, 230, "ERR", "Return 409 Conflict (Duplicate Email)", "error")

    draw_arrow_down(d, 320, 130, 155)
    draw_arrow_down(d, 320, 200, 230)
    draw_arrow_down(d, 320, 275, 315, text="No")
    draw_arrow_right(d, 440, 252, 460, text="Yes")
    draw_arrow_down(d, 320, 360, 395)
    draw_arrow_down(d, 320, 440, 475)

    im.save(os.path.join(OUTPUT_DIR, "activity-register-member.png"))

def gen_activity_borrow_book():
    w, h = 720, 640
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Activity Diagram: Borrow Book", "Atomic Borrowing & Availability Decrement", w)

    create_step(d, 220, 85, "1", "Librarian selects Member & Book", "start")
    create_step(d, 220, 150, "2", "Verify Member & Book exist", "step")
    create_step(d, 220, 220, "3", "Begin DB Transaction with row lock", "db")
    create_step(d, 220, 290, "4", "Is available_copies > 0?", "decision")
    create_step(d, 220, 375, "5", "Insert Loan record (due_date, returned_at=NULL)", "step")
    create_step(d, 220, 455, "6", "book.available_copies = available_copies - 1", "step")
    create_step(d, 220, 535, "7", "Commit Transaction & return 201 Created", "success")

    create_step(d, 490, 290, "ERR", "Rollback & Return 409 (No Copies Available)", "error")

    draw_arrow_down(d, 340, 130, 150)
    draw_arrow_down(d, 340, 195, 220)
    draw_arrow_down(d, 340, 265, 290)
    draw_arrow_down(d, 340, 335, 375, text="Yes")
    draw_arrow_right(d, 460, 312, 490, text="No")
    draw_arrow_down(d, 340, 420, 455)
    draw_arrow_down(d, 340, 500, 535)

    im.save(os.path.join(OUTPUT_DIR, "activity-borrow-book.png"))

def gen_activity_return_book():
    w, h = 720, 600
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Activity Diagram: Return Book", "Atomic Return & Availability Increment", w)

    create_step(d, 220, 85, "1", "Librarian selects active Loan to return", "start")
    create_step(d, 220, 155, "2", "Begin DB Transaction & query loan", "db")
    create_step(d, 220, 230, "3", "Is loan active (returned_at IS NULL)?", "decision")
    create_step(d, 220, 315, "4", "Set returned_at = current timestamp", "step")
    create_step(d, 220, 395, "5", "book.available_copies = available_copies + 1", "step")
    create_step(d, 220, 475, "6", "Commit Transaction & update status to Returned", "success")

    create_step(d, 490, 230, "ERR", "Rollback: Already returned (FR-43)", "error")

    draw_arrow_down(d, 340, 130, 155)
    draw_arrow_down(d, 340, 200, 230)
    draw_arrow_down(d, 340, 275, 315, text="Yes")
    draw_arrow_right(d, 460, 252, 490, text="No")
    draw_arrow_down(d, 340, 360, 395)
    draw_arrow_down(d, 340, 440, 475)

    im.save(os.path.join(OUTPUT_DIR, "activity-return-book.png"))

def gen_activity_search_catalogue():
    w, h = 650, 540
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Activity Diagram: Search Catalogue", "Book Browsing & Partial Text Matching", w)

    create_step(d, 200, 85, "1", "Member opens Catalogue page", "start")
    create_step(d, 200, 160, "2", "Type search query (title / author)", "step")
    create_step(d, 200, 235, "3", "Send GET /api/books?search=... with JWT", "step")
    create_step(d, 200, 310, "4", "PostgreSQL ILIKE query on title & author", "db")
    create_step(d, 200, 385, "5", "Derive Availability badge (Available vs Borrowed Out)", "step")
    create_step(d, 200, 460, "6", "Render responsive book cards grid", "success")

    draw_arrow_down(d, 320, 130, 160)
    draw_arrow_down(d, 320, 205, 235)
    draw_arrow_down(d, 320, 280, 310)
    draw_arrow_down(d, 320, 355, 385)
    draw_arrow_down(d, 320, 430, 460)

    im.save(os.path.join(OUTPUT_DIR, "activity-search-catalogue.png"))

def gen_activity_view_member_history():
    w, h = 680, 560
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Activity Diagram: Member History", "Secure Borrowing History Retrieval", w)

    create_step(d, 210, 85, "1", "Member opens 'My Borrowing History'", "start")
    create_step(d, 210, 160, "2", "Send GET /api/members/me/loans with Bearer token", "step")
    create_step(d, 210, 235, "3", "Extract member_id from authenticated token", "step")
    create_step(d, 210, 310, "4", "Query loans where member_id = session.member_id", "db")
    create_step(d, 210, 385, "5", "Calculate dynamic loan status (Borrowed, Overdue, Returned)", "step")
    create_step(d, 210, 465, "6", "Group into Current Loans vs Past History", "success")

    draw_arrow_down(d, 330, 130, 160)
    draw_arrow_down(d, 330, 205, 235)
    draw_arrow_down(d, 330, 280, 310)
    draw_arrow_down(d, 330, 355, 385)
    draw_arrow_down(d, 330, 430, 465)

    im.save(os.path.join(OUTPUT_DIR, "activity-view-member-history.png"))

# 3. DFD Level 0 & Level 1
def gen_dfd_0():
    w, h = 750, 440
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Data Flow Diagram: Context Level 0", "Top-level external entities and LMS process", w)

    create_card(d, 40, 110, 180, 130, "Librarian / Admin", [
        "Staff credentials",
        "Book & member data",
        "Borrow & return cmds"
    ], fill="#eff6ff", stroke="#3b82f6", title_fill="#1d4ed8")

    d.ellipse([270, 140, 480, 320], fill="#e0e7ff", outline="#4338ca", width=3)
    d.text((320, 205), "0.0 LMS", fill="#312e81", font=get_font(18, bold=True))
    d.text((295, 235), "University Library System", fill="#4338ca", font=get_font(11, bold=False))

    create_card(d, 530, 110, 180, 130, "Registered Member", [
        "Member credentials",
        "Catalogue queries",
        "History requests"
    ], fill="#f0fdf4", stroke="#22c55e", title_fill="#15803d")

    # Arrows
    draw_arrow_right(d, 220, 175, 280, text="Credentials, Updates, Loans")
    draw_arrow_right(d, 360, 230, 530, text="Book list, Personal History")
    draw_arrow_down(d, 375, 320, 380)

    d.text((60, 290), "LMS returns: Dashboard stats, Lists, Overdue reports", fill="#1e293b", font=get_font(11))
    d.text((490, 290), "Member sends: Search terms, Auth token", fill="#1e293b", font=get_font(11))

    im.save(os.path.join(OUTPUT_DIR, "dfd-level-0.png"))

def gen_dfd_1():
    w, h = 950, 680
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Data Flow Diagram: Level 1", "Decomposition into 8 major processes and 4 data stores", w)

    # Entities
    create_card(d, 30, 100, 160, 110, "Librarian", ["Admin credentials", "Books/members/loans"], fill="#eff6ff", stroke="#3b82f6", title_fill="#1d4ed8")
    create_card(d, 760, 100, 160, 110, "Member", ["Member credentials", "Search & history"], fill="#f0fdf4", stroke="#22c55e", title_fill="#15803d")

    # Processes
    procs = [
        (250, 90, "1.0", "Authenticate User"),
        (250, 160, "2.0", "Manage Books"),
        (250, 230, "3.0", "Manage Members"),
        (540, 160, "4.0", "Catalogue & Search"),
        (250, 320, "5.0", "Manage Borrowing"),
        (250, 400, "6.0", "Process Returns"),
        (250, 490, "7.0", "Dashboard & Overdue"),
        (540, 400, "8.0", "Retrieve Member History"),
    ]
    for x, y, pno, pname in procs:
        d.rounded_rectangle([x, y, x + 190, y + 42], radius=21, fill="#eef2ff", outline="#6366f1", width=2)
        d.text((x + 14, y + 6), f"{pno} {pname}", fill="#312e81", font=get_font(11, bold=True))

    # Data Stores
    stores = [
        (470, 90, "D1", "Users (Admin & Member logins)"),
        (470, 230, "D2", "Books (Catalog & Copies)"),
        (470, 300, "D3", "Members (Student/Faculty)"),
        (470, 520, "D4", "Loans (Borrow/Return tracking)"),
    ]
    for x, y, sid, sname in stores:
        d.rectangle([x, y, x + 240, y + 42], fill="#f8fafc", outline="#0284c7", width=2)
        d.line([x + 35, y, x + 35, y + 42], fill="#0284c7", width=2)
        d.text((x + 8, y + 12), sid, fill="#0369a1", font=get_font(12, bold=True))
        d.text((x + 42, y + 12), sname, fill="#0f172a", font=get_font(11))

    im.save(os.path.join(OUTPUT_DIR, "dfd-level-1.png"))

# 4. Class Diagram
def gen_class_diagram():
    w, h = 980, 680
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Class Diagram", "Entity Models, Services, and Architecture Layers", w)

    # Entities
    create_card(d, 30, 90, 200, 180, "User", [
        "+ user_id: int",
        "+ username: string",
        "+ password_hash: string",
        "+ role: UserRole",
        "+ member_id: Optional[int]",
        "+ verify_pwd(pwd) bool",
        "+ generate_token() str"
    ], fill="#ffffff", stroke="#94a3b8", title_fill="#0f172a")

    create_card(d, 260, 90, 210, 200, "Book", [
        "+ book_id: int",
        "+ title: string",
        "+ author: string",
        "+ category: string",
        "+ isbn: Optional[string]",
        "+ total_copies: int",
        "+ available_copies: int",
        "+ is_available() bool",
        "+ borrow_copy() void",
        "+ return_copy() void"
    ], fill="#ffffff", stroke="#94a3b8", title_fill="#0f172a")

    create_card(d, 500, 90, 200, 170, "Member", [
        "+ member_id: int",
        "+ full_name: string",
        "+ email: string",
        "+ phone: string",
        "+ registration_date: date",
        "+ created_at: datetime"
    ], fill="#ffffff", stroke="#94a3b8", title_fill="#0f172a")

    create_card(d, 730, 90, 220, 200, "Loan", [
        "+ loan_id: int",
        "+ member_id: int",
        "+ book_id: int",
        "+ borrowed_at: date",
        "+ due_date: date",
        "+ returned_at: Optional[date]",
        "+ get_status() LoanStatus",
        "+ is_overdue() bool",
        "+ mark_returned() void"
    ], fill="#ffffff", stroke="#94a3b8", title_fill="#0f172a")

    # Services
    create_card(d, 30, 340, 280, 280, "AuthService & MemberService", [
        "AuthService:",
        "+ authenticate(username, pwd)",
        "+ get_current_user(token)",
        "+ require_admin(user)",
        "",
        "MemberService:",
        "+ list_members(search, limit)",
        "+ get_member(id)",
        "+ register_member(data)",
        "+ update_member(id, data)",
        "+ delete_member(id) [safe]"
    ], fill="#eff6ff", stroke="#60a5fa", title_fill="#1e40af")

    create_card(d, 340, 340, 290, 280, "BookService & DashboardService", [
        "BookService:",
        "+ list_books(search, category)",
        "+ get_book_details(id)",
        "+ create_book(data)",
        "+ update_book(id, data)",
        "+ delete_book(id) [safe]",
        "",
        "DashboardService:",
        "+ get_summary():",
        "  total_books, total_members,",
        "  currently_borrowed, overdue"
    ], fill="#f0fdf4", stroke="#4ade80", title_fill="#166534")

    create_card(d, 660, 340, 290, 280, "LoanService", [
        "LoanService:",
        "+ borrow_book(member_id, book_id):",
        "  - Row-lock verification",
        "  - Atomically decrement copy",
        "+ return_book(loan_id):",
        "  - Atomically increment copy",
        "  - Prevent double return",
        "+ list_loans(status)",
        "+ get_overdue_loans()",
        "+ get_member_history(member_id)"
    ], fill="#faf5ff", stroke="#c084fc", title_fill="#6b21a8")

    im.save(os.path.join(OUTPUT_DIR, "class-diagram.png"))

# 5. ER Diagram
def gen_er_diagram():
    w, h = 950, 560
    im = Image.new("RGB", (w, h), "#f8fafc")
    d = ImageDraw.Draw(im)
    draw_header(d, "Entity Relationship Diagram (ERD)", "PostgreSQL Relational Schema with Constraints & Cardinalities", w)

    create_card(d, 40, 100, 200, 180, "USERS (Table)", [
        "user_id: INT (PK)",
        "username: VARCHAR(100) (UK)",
        "password_hash: VARCHAR(255)",
        "role: VARCHAR(20) (ADMIN|MEMBER)",
        "member_id: INT (FK, Nullable)",
        "created_at: TIMESTAMP"
    ], fill="#ffffff", stroke="#0284c7", title_fill="#0369a1")

    create_card(d, 280, 100, 210, 200, "MEMBERS (Table)", [
        "member_id: INT (PK)",
        "full_name: VARCHAR(200)",
        "email: VARCHAR(255) (UK)",
        "phone: VARCHAR(30)",
        "registration_date: DATE",
        "created_at: TIMESTAMP",
        "updated_at: TIMESTAMP"
    ], fill="#ffffff", stroke="#0284c7", title_fill="#0369a1")

    create_card(d, 530, 100, 220, 220, "BOOKS (Table)", [
        "book_id: INT (PK)",
        "title: VARCHAR(255)",
        "author: VARCHAR(255)",
        "category: VARCHAR(100)",
        "isbn: VARCHAR(20) (UK)",
        "total_copies: INT (>=0)",
        "available_copies: INT (>=0)",
        "created_at: TIMESTAMP",
        "updated_at: TIMESTAMP"
    ], fill="#ffffff", stroke="#0284c7", title_fill="#0369a1")

    create_card(d, 400, 360, 240, 170, "LOANS (Table)", [
        "loan_id: INT (PK)",
        "member_id: INT (FK -> members)",
        "book_id: INT (FK -> books)",
        "borrowed_at: DATE",
        "due_date: DATE",
        "returned_at: DATE (Nullable)",
        "created_at: TIMESTAMP"
    ], fill="#ffffff", stroke="#0284c7", title_fill="#0369a1")

    # Cardinality connectors
    draw_arrow_right(d, 240, 170, 280, text="1 : 0..1 (links)")
    draw_arrow_down(d, 380, 300, 360, text="1 : 0..N")
    draw_arrow_down(d, 620, 320, 360, text="1 : 0..N")

    im.save(os.path.join(OUTPUT_DIR, "er-diagram.png"))

if __name__ == "__main__":
    print("Generating diagram PNGs...")
    gen_use_case()
    gen_activity_admin_login()
    gen_activity_add_book()
    gen_activity_register_member()
    gen_activity_borrow_book()
    gen_activity_return_book()
    gen_activity_search_catalogue()
    gen_activity_view_member_history()
    gen_dfd_0()
    gen_dfd_1()
    gen_class_diagram()
    gen_er_diagram()
    print("All diagram PNGs successfully generated in docs/diagrams/!")
