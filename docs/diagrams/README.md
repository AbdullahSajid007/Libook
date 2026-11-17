# University Library Management System - System Diagrams

This directory contains the architecture and design diagrams created according to **Section 6** of [planning.md](../../planning.md).

---

## 1. Use Case Diagram
File: `use-case-diagram.mmd`

```mermaid
graph LR
    subgraph Actors
        Admin["👨‍💼 Librarian / Administrator"]
        Member["🎓 Registered Member"]
    end

    subgraph "Library Management System (LMS)"
        UC1["FR-01, 02, 03: Login / Logout"]
        UC2["FR-54..59: View Dashboard"]
        UC3["FR-07..15: Manage Books (Add, View, Update, Remove)"]
        UC4["FR-16..23: Manage Members (Register, View, Update, Remove)"]
        UC5["FR-30..38: Create Borrowing Record"]
        UC6["FR-39..44: Process Book Return"]
        UC7["FR-45..48: View Overdue Loans"]
        UC8["FR-24..29: Browse & Search Catalogue"]
        UC9["FR-49..53: View Own Borrowing History"]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8

    Member --> UC1
    Member --> UC8
    Member --> UC9
```

---

## 2. Activity Diagrams

### 2.1 Admin & Member Login (`activity-admin-login.mmd`)
```mermaid
stateDiagram-v2
    [*] --> EnterCredentials: User enters username and password
    EnterCredentials --> ValidateInput: Submit form
    ValidateInput --> CheckDB: Query User record
    CheckDB --> VerifyHash: Check bcrypt password_hash
    
    state credentials_valid <<choice>>
    VerifyHash --> credentials_valid: Is password valid?
    
    credentials_valid --> ShowError: No
    ShowError --> EnterCredentials: Show clear error message (FR-02)
    
    credentials_valid --> GenerateToken: Yes
    GenerateToken --> CheckRole: Issue secure JWT
    
    state role_choice <<choice>>
    CheckRole --> role_choice: Check user role
    
    role_choice --> AdminDashboard: Role is ADMIN
    role_choice --> MemberCatalogue: Role is MEMBER
    
    AdminDashboard --> [*]
    MemberCatalogue --> [*]
```

### 2.2 Add Book (`activity-add-book.mmd`)
```mermaid
stateDiagram-v2
    [*] --> OpenForm: Librarian opens Add Book form
    OpenForm --> FillDetails: Input Title, Author, Category, ISBN, Total Copies
    FillDetails --> ValidateClient: Submit form
    ValidateClient --> ValidateServer: Send POST /api/books with Bearer Token
    
    state valid_inputs <<choice>>
    ValidateServer --> valid_inputs: Fields valid & total_copies >= 0?
    
    valid_inputs --> RejectValidation: No
    RejectValidation --> OpenForm: Show validation error (FR-10)
    
    valid_inputs --> CheckISBN: Yes
    
    state isbn_check <<choice>>
    CheckISBN --> isbn_check: ISBN already exists in DB?
    
    isbn_check --> RejectDuplicate: Yes
    RejectDuplicate --> OpenForm: Show duplicate ISBN error (FR-11)
    
    isbn_check --> SaveBook: No
    SaveBook --> SetCopies: Set available_copies = total_copies
    SetCopies --> PersistDB: Commit to PostgreSQL
    PersistDB --> SuccessUI: Return 201 Created & show in book list
    SuccessUI --> [*]
```

### 2.3 Register Member (`activity-register-member.mmd`)
```mermaid
stateDiagram-v2
    [*] --> OpenMemberForm: Librarian opens Register Member
    OpenMemberForm --> InputData: Enter Full Name, Email, Phone, Registration Date
    InputData --> ValidateClient: Submit form
    ValidateClient --> ValidateServer: Send POST /api/members
    
    state format_valid <<choice>>
    ValidateServer --> format_valid: Email/Phone valid format?
    
    format_valid --> RejectFormat: No
    RejectFormat --> OpenMemberForm: Show format validation error
    
    format_valid --> CheckEmailUniqueness: Yes
    
    state email_unique <<choice>>
    CheckEmailUniqueness --> email_unique: Is email already registered?
    
    email_unique --> RejectEmail: Yes
    RejectEmail --> OpenMemberForm: Show duplicate email error (FR-20)
    
    email_unique --> CreateMember: No
    CreateMember --> CreateOptionalLogin: Generate Member record (and optional login)
    CreateOptionalLogin --> CommitMember: Commit transaction in PostgreSQL
    CommitMember --> ShowMemberSuccess: Return 201 Created & display in member table
    ShowMemberSuccess --> [*]
```

### 2.4 Borrow Book (`activity-borrow-book.mmd`)
```mermaid
stateDiagram-v2
    [*] --> OpenBorrowModal: Librarian navigates to Borrow Book
    OpenBorrowModal --> SelectMemberBook: Select Member, Book, Borrow Date, Due Date
    SelectMemberBook --> ValidateClient: Click "Confirm Borrow"
    ValidateClient --> ServerValidation: POST /api/loans
    ServerValidation --> VerifyEntities: Check Member & Book exist
    
    state entities_exist <<choice>>
    VerifyEntities --> entities_exist: Do both exist?
    
    entities_exist --> StopNotFound: No
    StopNotFound --> [*]: Return 404 Not Found
    
    entities_exist --> CheckAvailable: Yes
    CheckAvailable --> BeginTx: Start DB Transaction with row lock (FOR UPDATE)
    
    state copy_check <<choice>>
    BeginTx --> copy_check: Is available_copies > 0?
    
    copy_check --> RollbackEmpty: No
    RollbackEmpty --> ShowNoCopyError: Rollback transaction (FR-36)
    ShowNoCopyError --> [*]: Return 409 Conflict (No copies available)
    
    copy_check --> ExecuteBorrow: Yes
    ExecuteBorrow --> InsertLoan: Insert into loans (borrowed_at, due_date, returned_at=NULL)
    InsertLoan --> DecrementCopy: Decrement book.available_copies by 1
    DecrementCopy --> CommitTx: Commit Transaction atomically (FR-34)
    CommitTx --> ShowSuccess: Return 201 Created & update availability UI
    ShowSuccess --> [*]
```

### 2.5 Return Book (`activity-return-book.mmd`)
```mermaid
stateDiagram-v2
    [*] --> ViewActiveLoans: Librarian views active loans
    ViewActiveLoans --> SelectLoan: Librarian clicks "Mark as Returned"
    SelectLoan --> PromptConfirm: System requests confirmation with Return Date
    PromptConfirm --> SendReturnReq: PATCH /api/loans/:id/return
    SendReturnReq --> StartTx: Begin DB Transaction
    StartTx --> FetchLoan: Query loan record by loan_id
    
    state loan_exists <<choice>>
    FetchLoan --> loan_exists: Loan exists and returned_at is NULL?
    
    loan_exists --> RejectDuplicateReturn: Already returned (not NULL)
    RejectDuplicateReturn --> RollbackTx1: Return 400/409 (Loan already returned FR-43)
    RollbackTx1 --> [*]
    
    loan_exists --> ProcessReturn: Yes, currently active
    ProcessReturn --> UpdateLoan: Set returned_at = current timestamp
    UpdateLoan --> IncrementCopy: Increment book.available_copies by 1
    IncrementCopy --> CommitTx: Commit Transaction atomically (FR-42, FR-44)
    CommitTx --> UpdateUI: Return 200 OK & update status to Returned
    UpdateUI --> [*]
```

### 2.6 Search Catalogue (`activity-search-catalogue.mmd`)
```mermaid
stateDiagram-v2
    [*] --> OpenCatalogue: Member opens Book Catalogue
    OpenCatalogue --> InputQuery: Type search term in search bar
    InputQuery --> ChooseFilter: Select Filter (Title, Author, or All)
    ChooseFilter --> TriggerSearch: Submit query or debounce input
    TriggerSearch --> FetchAPI: GET /api/books?search=...
    FetchAPI --> QueryPostgres: SQL ILIKE search on title and author
    QueryPostgres --> FormatResults: Compute availability badge (Available vs Borrowed out)
    FormatResults --> DisplayCards: Render responsive book grid
    DisplayCards --> [*]
```

### 2.7 View Member History (`activity-view-member-history.mmd`)
```mermaid
stateDiagram-v2
    [*] --> NavigateHistory: Member navigates to "My Borrowing History"
    NavigateHistory --> SendMeLoans: GET /api/members/me/loans with Bearer Token
    SendMeLoans --> ExtractAuth: Backend verifies JWT and extracts user_id & member_id
    
    state has_member <<choice>>
    ExtractAuth --> has_member: Is user linked to valid Member?
    
    has_member --> ForbiddenAccess: No member account linked
    ForbiddenAccess --> [*]: Return 403 Forbidden
    
    has_member --> FetchLoans: Yes, authenticated member
    FetchLoans --> QueryDB: SELECT * FROM loans WHERE member_id = session.member_id
    QueryDB --> DeriveStatus: Compute status for each loan (Borrowed, Overdue, Returned)
    DeriveStatus --> SplitLists: Group into "Currently Borrowed" and "Returned History"
    SplitLists --> RenderHistoryUI: Display cards with book details, due dates, badges
    RenderHistoryUI --> [*]
```

---

## 3. Data Flow Diagrams (DFD)

### 3.1 Context Diagram (Level 0 DFD - `dfd-level-0.mmd`)
```mermaid
graph TD
    subgraph External_Entities
        Librarian["Librarian / Administrator"]
        Member["Registered Member"]
    end

    System(("0.0<br/>University Library<br/>Management System"))

    Librarian -->|"1. Credentials, Book/Member Info, Borrow/Return Actions"| System
    System -->|"2. Auth Token, Dashboard Stats, Lists, Confirmation"| Librarian

    Member -->|"3. Credentials, Search Query, History Request"| System
    System -->|"4. Catalogue Results, Availability, Personal Loan History"| Member
```

### 3.2 Level 1 DFD (`dfd-level-1.mmd`)
```mermaid
graph TD
    Librarian["Librarian / Administrator"]
    Member["Registered Member"]

    D1[("D1: Users")]
    D2[("D2: Books")]
    D3[("D3: Members")]
    D4[("D4: Loans")]

    P1(("1.0<br/>Authenticate<br/>User"))
    P2(("2.0<br/>Manage<br/>Books"))
    P3(("3.0<br/>Manage<br/>Members"))
    P4(("4.0<br/>Browse & Search<br/>Catalogue"))
    P5(("5.0<br/>Manage<br/>Borrowing"))
    P6(("6.0<br/>Process<br/>Returns"))
    P7(("7.0<br/>Generate Dashboard<br/>& Reports"))
    P8(("8.0<br/>Retrieve Member<br/>History"))

    Librarian -->|"Login Credentials"| P1
    Member -->|"Login Credentials"| P1
    P1 <-->|"Verify Hash / Token"| D1
    P1 -->|"Auth Token & Role"| Librarian
    P1 -->|"Auth Token & Role"| Member

    Librarian -->|"Book Details (CRUD)"| P2
    P2 <-->|"Read / Write Books"| D2
    P2 -->|"Book Records / Status"| Librarian

    Librarian -->|"Member Details (CRUD)"| P3
    P3 <-->|"Read / Write Members"| D3
    P3 -->|"Member Records / Status"| Librarian

    Member -->|"Search Query (Title/Author)"| P4
    P4 <--|"Read Book Data & Copies"| D2
    P4 -->|"Book List & Availability"| Member

    Librarian -->|"Borrow Request (Member + Book)"| P5
    P5 <-->|"Check Availability & Decrement Copy"| D2
    P5 <--|"Verify Member ID"| D3
    P5 -->|"Write New Loan"| D4
    P5 -->|"Borrowing Confirmation"| Librarian

    Librarian -->|"Return Request (Loan ID)"| P6
    P6 <-->|"Update returned_at"| D4
    P6 <-->|"Increment Available Copies"| D2
    P6 -->|"Return Confirmation"| Librarian

    Librarian -->|"Request Dashboard / Overdue"| P7
    P7 <--|"Count Total Books"| D2
    P7 <--|"Count Members"| D3
    P7 <--|"Count Active / Overdue Loans"| D4
    P7 -->|"Dashboard Metrics & Overdue Table"| Librarian

    Member -->|"Request My History"| P8
    P8 <--|"Query Loans for Member"| D4
    P8 <--|"Read Book Details"| D2
    P8 -->|"Current & Past Loans"| Member
```

---

## 4. Class Diagram (`class-diagram.mmd`)
```mermaid
classDiagram
    direction TB

    class UserRole {
        <<enumeration>>
        ADMIN
        MEMBER
    }

    class LoanStatus {
        <<enumeration>>
        BORROWED
        OVERDUE
        RETURNED
    }

    class User {
        +int user_id
        +string username
        +string password_hash
        +UserRole role
        +int member_id
        +datetime created_at
        +verify_password(plain_password) bool
    }

    class Book {
        +int book_id
        +string title
        +string author
        +string category
        +string isbn
        +int total_copies
        +int available_copies
        +datetime created_at
        +datetime updated_at
        +is_available() bool
        +borrow_copy() void
        +return_copy() void
    }

    class Member {
        +int member_id
        +string full_name
        +string email
        +string phone
        +date registration_date
        +datetime created_at
        +datetime updated_at
    }

    class Loan {
        +int loan_id
        +int member_id
        +int book_id
        +date borrowed_at
        +date due_date
        +date returned_at
        +datetime created_at
        +get_status() LoanStatus
        +is_overdue() bool
    }

    class AuthService {
        +authenticate_user(username, password) TokenResponse
        +get_current_user(token) User
        +verify_admin(user) void
    }

    class BookService {
        +list_books(search, skip, limit) List~Book~
        +get_book(book_id) Book
        +create_book(data) Book
        +update_book(book_id, data) Book
        +delete_book(book_id) bool
    }

    class MemberService {
        +list_members(search, skip, limit) List~Member~
        +get_member(member_id) Member
        +create_member(data) Member
        +update_member(member_id, data) Member
        +delete_member(member_id) bool
    }

    class LoanService {
        +borrow_book(member_id, book_id, due_date) Loan
        +return_book(loan_id) Loan
        +list_loans(status, member_id, book_id) List~Loan~
        +get_overdue_loans() List~Loan~
        +get_member_history(member_id) List~Loan~
    }

    class DashboardService {
        +get_summary_counts() DashboardSummary
    }

    User "0..1" --> "1" Member : links to
    Member "1" --> "0..*" Loan : has
    Book "1" --> "0..*" Loan : lent in
    Loan --> LoanStatus : has
    User --> UserRole : has

    AuthService ..> User : manages
    BookService ..> Book : operates on
    MemberService ..> Member : operates on
    LoanService ..> Loan : manages
    LoanService ..> Book : updates availability
    LoanService ..> Member : verifies
    DashboardService ..> Book : queries
    DashboardService ..> Member : queries
    DashboardService ..> Loan : queries
```

---

## 5. Entity Relationship (ER) Diagram (`er-diagram.mmd`)
```mermaid
erDiagram
    USERS {
        int user_id PK
        string username UK
        string password_hash
        string role "ADMIN | MEMBER"
        int member_id FK "Nullable"
        datetime created_at
    }

    MEMBERS {
        int member_id PK
        string full_name
        string email UK
        string phone
        date registration_date
        datetime created_at
        datetime updated_at
    }

    BOOKS {
        int book_id PK
        string title
        string author
        string category
        string isbn UK "Nullable, unique if present"
        int total_copies ">= 0"
        int available_copies "0 <= available <= total"
        datetime created_at
        datetime updated_at
    }

    LOANS {
        int loan_id PK
        int member_id FK
        int book_id FK
        date borrowed_at
        date due_date
        date returned_at "Nullable until returned"
        datetime created_at
    }

    USERS |o--|| MEMBERS : "links to (if role=MEMBER)"
    MEMBERS ||--o{ LOANS : "borrows"
    BOOKS ||--o{ LOANS : "included in"
```
