# University Library Management System --- Project Planning

> **Purpose:** This document is the single source of truth for planning,
> designing, implementing, and testing the University Library Management
> System (LMS). Follow the requirements and implementation order below.
> Do not add unrelated features unless they are clearly marked as
> optional.

------------------------------------------------------------------------

## 1. Project Overview

### 1.1 Project name

**University Library Management System**

### 1.2 Project objective

Build a simple, responsive, web-based system that replaces manual
library record keeping. The application will help the librarian manage
books, members, borrowing and returns, while allowing registered members
to browse books, search the catalogue, and view their own borrowing
history.

### 1.3 Main user roles

  -----------------------------------------------------------------------
  Role                                Description
  ----------------------------------- -----------------------------------
  Librarian / Administrator           Authenticated staff user who
                                      manages books, members, loans,
                                      returns, and the dashboard.

  Member                              Registered library member who can
                                      browse/search books and view their
                                      own borrowing history.
  -----------------------------------------------------------------------

**Important:** A member is not automatically an administrator. Protect
all administrator operations with role-based authorization.

### 1.4 Project boundaries

The required version includes: - Administrator login and logout. - Book
catalogue CRUD (Create, Read, Update, Delete). - Member record CRUD. -
Public-to-registered-members catalogue browsing and search. - Borrowing
and returning workflow. - Borrowing history for each member. -
Overdue-loan identification. - Librarian dashboard and summary counts.

The brief does not require online payments, fines, reservations/holds,
barcode scanning, email/SMS notifications, multiple library branches, or
self-service member registration. Do not implement these unless the
project supervisor requests them.

------------------------------------------------------------------------

## 2. Functional Requirements

Use the IDs below in the diagrams, implementation checklist, and test
cases.

### 2.1 Authentication and authorization

  ----------------------------------------------------------------------------
  ID                Functional requirement Actor             Priority
  ----------------- ---------------------- ----------------- -----------------
  FR-01             The librarian shall be Librarian         Must
                    able to log in using                     
                    valid administrator                      
                    credentials.                             

  FR-02             The system shall       Librarian         Must
                    reject invalid login                     
                    credentials and show a                   
                    clear error message.                     

  FR-03             The librarian shall be Librarian         Must
                    able to log out                          
                    securely.                                

  FR-04             The system shall       System            Must
                    restrict book, member,                   
                    loan, return, and                        
                    dashboard-management                     
                    pages to authenticated                   
                    administrators.                          

  FR-05             The system shall       Member            Must
                    provide member access                    
                    to the catalogue and                     
                    the member's own                         
                    borrowing history                        
                    only.                                    

  FR-06             The system shall       System            Must
                    prevent a member from                    
                    viewing or changing                      
                    another member's                         
                    private borrowing                        
                    history.                                 
  ----------------------------------------------------------------------------

**Implementation note:** The project needs at least one administrator
account. Create it through a secure seed script or an administrator
setup process. Do not hard-code a plain-text password in frontend code
or commit real credentials to the repository. Store password hashes, not
plain-text passwords.

### 2.2 Book management

Each book record must contain: - Unique Book ID. - Title. - Author. -
Category. - ISBN. - Total number of available copies.

  -----------------------------------------------------------------------
  ID                Functional        Actor             Priority
                    requirement                         
  ----------------- ----------------- ----------------- -----------------
  FR-07             The librarian     Librarian         Must
                    shall be able to                    
                    view all                            
                    registered books.                   

  FR-08             The librarian     Librarian         Must
                    shall be able to                    
                    add a new book                      
                    with all required                   
                    book details.                       

  FR-09             The system shall  System            Must
                    generate or                         
                    validate a unique                   
                    Book ID for each                    
                    book.                               

  FR-10             The system shall  System            Must
                    validate required                   
                    fields and ensure                   
                    the copy count is                   
                    a non-negative                      
                    whole number.                       

  FR-11             The system shall  System            Must
                    prevent duplicate                   
                    ISBN values where                   
                    ISBN is supplied                    
                    as a unique                         
                    identifier.                         

  FR-12             The librarian     Librarian         Must
                    shall be able to                    
                    update an                           
                    existing book's                     
                    information.                        

  FR-13             The librarian     Librarian         Must
                    shall be able to                    
                    remove a book                       
                    record when it is                   
                    safe to do so.                      

  FR-14             The system shall  System            Must
                    show useful book                    
                    information,                        
                    including the                       
                    number of copies                    
                    currently                           
                    available.                          

  FR-15             The system shall  Librarian         Should
                    allow the                           
                    librarian to find                   
                    a book in the                       
                    management list.                    
  -----------------------------------------------------------------------

**Important data rule:** The brief describes the field as the number of
available copies, but a borrowing workflow also needs to restore copies
on return and identify currently borrowed copies. For reliable tracking,
implement `total_copies` and `available_copies` as separate fields.
Derive `borrowed_copies = total_copies - available_copies`. The UI may
label these clearly. If the project is required to use only one
copy-count field, clarify this with the supervisor before
implementation.

**Book deletion rule:** Do not permanently delete a book that has active
borrowing records. Block deletion and explain why, or use a safe
archive/soft-delete approach. Preserve historical loan records.

### 2.3 Member management

Each member record must contain: - Unique Member ID. - Full name. -
Email address. - Phone number. - Registration date.

  -----------------------------------------------------------------------
  ID                Functional        Actor             Priority
                    requirement                         
  ----------------- ----------------- ----------------- -----------------
  FR-16             The librarian     Librarian         Must
                    shall be able to                    
                    view all                            
                    registered                          
                    members.                            

  FR-17             The librarian     Librarian         Must
                    shall be able to                    
                    register a new                      
                    member.                             

  FR-18             The system shall  System            Must
                    generate or                         
                    validate a unique                   
                    Member ID.                          

  FR-19             The system shall  System            Must
                    validate the                        
                    member's name,                      
                    email, phone                        
                    number, and                         
                    registration                        
                    date.                               

  FR-20             The system shall  System            Must
                    prevent duplicate                   
                    member email                        
                    addresses.                          

  FR-21             The librarian     Librarian         Must
                    shall be able to                    
                    update a member's                   
                    information.                        

  FR-22             The librarian     Librarian         Must
                    shall be able to                    
                    remove a member                     
                    record when it is                   
                    safe to do so.                      

  FR-23             The system shall  System            Must
                    preserve loan                       
                    history and                         
                    prevent removal                     
                    of a member who                     
                    has active loans,                   
                    unless a safe                       
                    archival policy                     
                    is used.                            
  -----------------------------------------------------------------------

### 2.4 Catalogue browsing and search

  -------------------------------------------------------------------------
  ID                Functional          Actor             Priority
                    requirement                           
  ----------------- ------------------- ----------------- -----------------
  FR-24             A registered member Member            Must
                    shall be able to                      
                    browse the book                       
                    catalogue.                            

  FR-25             The catalogue shall System            Must
                    show each book's                      
                    title, author,                        
                    category, and                         
                    availability.                         

  FR-26             A member shall be   Member            Must
                    able to search                        
                    books by title.                       

  FR-27             A member shall be   Member            Must
                    able to search                        
                    books by author                       
                    name.                                 

  FR-28             Search shall        System            Should
                    support partial                       
                    text matches and                      
                    should be                             
                    case-insensitive.                     

  FR-29             The system shall    System            Must
                    clearly distinguish                   
                    available books                       
                    from books with no                    
                    available copies.                     
  -------------------------------------------------------------------------

### 2.5 Borrowing management

A borrowing record (also called a loan) must record: - Unique
Loan/Borrowing ID. - Member. - Book. - Borrowing date. - Expected return
date. - Actual return date (empty until returned). - Loan status.

  -----------------------------------------------------------------------
  ID                Functional        Actor             Priority
                    requirement                         
  ----------------- ----------------- ----------------- -----------------
  FR-30             The librarian     Librarian         Must
                    shall be able to                    
                    create a                            
                    borrowing record                    
                    for a registered                    
                    member and a                        
                    book.                               

  FR-31             The system shall  System            Must
                    allow borrowing                     
                    only when at                        
                    least one copy is                   
                    available.                          

  FR-32             The system shall  System            Must
                    validate that the                   
                    selected member                     
                    and book exist.                     

  FR-33             The system shall  System            Must
                    record the                          
                    member, book,                       
                    borrowing date,                     
                    and expected                        
                    return date.                        

  FR-34             The system shall  System            Must
                    automatically                       
                    reduce the book's                   
                    available-copy                      
                    count by one                        
                    after a                             
                    successful                          
                    borrowing                           
                    operation.                          

  FR-35             The system shall  System            Must
                    prevent the                         
                    available-copy                      
                    count from                          
                    becoming                            
                    negative.                           

  FR-36             The system shall  System            Must
                    display a clear                     
                    message if                          
                    borrowing cannot                    
                    be completed                        
                    because no copy                     
                    is available.                       

  FR-37             The librarian     Librarian         Must
                    shall be able to                    
                    view all                            
                    borrowing                           
                    records.                            

  FR-38             The system shall  System            Must
                    show the current                    
                    status of each                      
                    loan: Borrowed,                     
                    Returned, or                        
                    Overdue.                            
  -----------------------------------------------------------------------

**Borrowing transaction rule:** Creating a loan and decreasing
`available_copies` must happen in one database transaction. If either
operation fails, roll back both. Use a row lock or equivalent
concurrency-safe update so two users cannot borrow the final copy at the
same time.

### 2.6 Return management

  -----------------------------------------------------------------------
  ID                Functional        Actor             Priority
                    requirement                         
  ----------------- ----------------- ----------------- -----------------
  FR-39             The librarian     Librarian         Must
                    shall be able to                    
                    locate an active                    
                    borrowing record.                   

  FR-40             The librarian     Librarian         Must
                    shall be able to                    
                    mark a borrowed                     
                    book as returned.                   

  FR-41             The system shall  System            Must
                    record the actual                   
                    return date.                        

  FR-42             The system shall  System            Must
                    automatically                       
                    increase the                        
                    book's                              
                    available-copy                      
                    count by one                        
                    after a                             
                    successful                          
                    return.                             

  FR-43             The system shall  System            Must
                    prevent the same                    
                    loan from being                     
                    returned more                       
                    than once.                          

  FR-44             The return        System            Must
                    operation and                       
                    available-copy                      
                    update shall be                     
                    completed                           
                    atomically.                         
  -----------------------------------------------------------------------

### 2.7 Overdue loan tracking

  -----------------------------------------------------------------------
  ID                Functional        Actor             Priority
                    requirement                         
  ----------------- ----------------- ----------------- -----------------
  FR-45             The librarian     Librarian         Must
                    shall be able to                    
                    view loans that                     
                    have not been                       
                    returned by their                   
                    expected return                     
                    dates.                              

  FR-46             The system shall  System            Must
                    identify an                         
                    active loan as                      
                    overdue when its                    
                    expected return                     
                    date is earlier                     
                    than the current                    
                    date.                               

  FR-47             A returned loan   System            Must
                    shall not be                        
                    shown as                            
                    currently                           
                    overdue.                            

  FR-48             The overdue list  Librarian         Must
                    shall show                          
                    relevant member,                    
                    book, borrowing                     
                    date, expected                      
                    return date, and                    
                    overdue status.                     
  -----------------------------------------------------------------------

**Status rule:** A loan is `Returned` if `returned_at` is set.
Otherwise, it is `Overdue` if `due_date` is before today's date;
otherwise, it is `Borrowed`. Calculate overdue status dynamically rather
than relying only on a manually updated status field.

### 2.8 Member borrowing history

  -----------------------------------------------------------------------
  ID                Functional        Actor             Priority
                    requirement                         
  ----------------- ----------------- ----------------- -----------------
  FR-49             A member shall be Member            Must
                    able to view                        
                    their own                           
                    borrowing                           
                    history.                            

  FR-50             The history shall Member            Must
                    include currently                   
                    borrowed books.                     

  FR-51             The history shall Member            Must
                    include                             
                    previously                          
                    returned books.                     

  FR-52             Each history item System            Must
                    shall show book                     
                    details,                            
                    borrowing date,                     
                    expected return                     
                    date, actual                        
                    return date when                    
                    applicable, and                     
                    status.                             

  FR-53             The system shall  System            Must
                    obtain the member                   
                    identity from the                   
                    authenticated                       
                    session and shall                   
                    not trust a                         
                    member ID                           
                    supplied by the                     
                    browser to                          
                    authorize history                   
                    access.                             
  -----------------------------------------------------------------------

### 2.9 Librarian dashboard

  -----------------------------------------------------------------------
  ID                Functional        Actor             Priority
                    requirement                         
  ----------------- ----------------- ----------------- -----------------
  FR-54             The librarian     Librarian         Must
                    shall see a                         
                    dashboard after                     
                    successful login.                   

  FR-55             The dashboard     System            Must
                    shall show the                      
                    total number of                     
                    book                                
                    titles/records.                     

  FR-56             The dashboard     System            Must
                    shall show the                      
                    total number of                     
                    registered                          
                    members.                            

  FR-57             The dashboard     System            Must
                    shall show the                      
                    number of                           
                    currently                           
                    borrowed                            
                    books/copies.                       

  FR-58             The dashboard     System            Must
                    shall show the                      
                    number of overdue                   
                    loans.                              

  FR-59             Dashboard figures System            Must
                    shall be                            
                    calculated from                     
                    current database                    
                    records.                            
  -----------------------------------------------------------------------

**Counting definitions:** - Total books: number of book records/titles.
Optionally show total physical copies separately. - Registered members:
number of active member records. - Currently borrowed: number of active
loan records (copies), not the number of distinct titles. - Overdue:
number of active loan records whose due date has passed.

------------------------------------------------------------------------

## 3. Business Rules and Data Validation

1.  Every book, member, and loan must have a unique primary identifier.
2.  ISBN must be unique when present; validate its format reasonably,
    without assuming every local book has an ISBN.
3.  A member email must be unique.
4.  `total_copies` must be a non-negative integer.
5.  `available_copies` must be an integer from zero through
    `total_copies`.
6.  Borrowing is allowed only when `available_copies > 0`.
7.  A successful borrow decreases available copies by exactly one.
8.  A successful return increases available copies by exactly one.
9.  A loan can be returned only once.
10. `due_date` must not be earlier than `borrowed_at`.
11. Do not delete books or members with active loans. Preserve
    historical references.
12. A returned loan is never overdue.
13. Members can access only their own history.
14. Administrator-only APIs must enforce authorization on the server,
    not merely hide buttons in the frontend.
15. Store dates consistently in the database; display them in a clear
    local format in the UI.
16. Use database transactions for borrow and return operations.
17. Use parameterized queries or a safe ORM to prevent SQL injection.
18. Validate inputs on both client and server; server validation is
    authoritative.

------------------------------------------------------------------------

## 4. Suggested Technology and Architecture

Use the following stack unless the project environment or instructor
specifies another one:

  Layer             Suggested technology
  ----------------- --------------------------------------------
  Frontend          React + Vite
  Language          JavaScript or TypeScript
  Styling           Tailwind CSS or Bootstrap
  Backend           Node.js + Express
  Database          MySQL
  Database access   Prisma or Sequelize ORM
  Authentication    Server-side session or secure JWT approach
  Version control   Git + GitHub

### 4.1 Architecture

Use a three-layer architecture:

1.  **Presentation layer:** React pages, components, forms, tables,
    navigation, and dashboard.
2.  **Application/API layer:** Express routes, authentication
    middleware, validation, business logic, and authorization.
3.  **Data layer:** MySQL tables and ORM/repository operations.

The frontend must communicate with the backend through REST API
endpoints. Do not connect the browser directly to the database.

### 4.2 Suggested project structure

Adapt this structure to the selected stack, but keep frontend and
backend responsibilities clear.

``` text
library-management-system/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   ├── books/
│       │   ├── members/
│       │   └── loans/
│       ├── pages/
│       │   ├── auth/
│       │   ├── admin/
│       │   └── member/
│       ├── services/
│       ├── hooks/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── repositories/
│   │   ├── utils/
│   │   └── app.js
│   ├── prisma/ or migrations/
│   └── server.js
├── docs/
│   ├── diagrams/
│   └── screenshots/
├── planning.md
├── README.md
└── .gitignore
```

------------------------------------------------------------------------

## 5. Database Design Plan

### 5.1 Main entities / tables

#### `users`

Stores login accounts and roles.

  Field           Suggested type            Constraints / notes
  --------------- ------------------------- ---------------------------------------------
  user_id         INT / UUID                Primary key
  username        VARCHAR(100)              Unique
  password_hash   VARCHAR(255)              Required; never plain text
  role            ENUM('ADMIN', 'MEMBER')   Required
  member_id       INT / UUID                Nullable; FK to members for member accounts
  created_at      DATETIME                  Required

A librarian account uses role `ADMIN`. A member login uses role `MEMBER`
and is linked to exactly one member record. If the first version does
not include member login credentials, member catalogue/history access
must be clarified with the supervisor; the requirement to view personal
history implies a secure way to authenticate members.

#### `books`

  Field              Suggested type   Constraints / notes
  ------------------ ---------------- --------------------------------------
  book_id            INT / UUID       Primary key
  title              VARCHAR(255)     Required
  author             VARCHAR(255)     Required
  category           VARCHAR(100)     Required
  isbn               VARCHAR(20)      Unique when present
  total_copies       INT              Required, \>= 0
  available_copies   INT              Required, \>= 0 and \<= total_copies
  created_at         DATETIME         Required
  updated_at         DATETIME         Required

#### `members`

  Field               Suggested type   Constraints / notes
  ------------------- ---------------- ---------------------
  member_id           INT / UUID       Primary key
  full_name           VARCHAR(200)     Required
  email               VARCHAR(255)     Required, unique
  phone               VARCHAR(30)      Required
  registration_date   DATE             Required
  created_at          DATETIME         Required
  updated_at          DATETIME         Required

#### `loans`

  Field         Suggested type     Constraints / notes
  ------------- ------------------ -------------------------
  loan_id       INT / UUID         Primary key
  member_id     INT / UUID         FK to members
  book_id       INT / UUID         FK to books
  borrowed_at   DATE or DATETIME   Required
  due_date      DATE               Required
  returned_at   DATE or DATETIME   Nullable until returned
  created_at    DATETIME           Required

Loan status should preferably be derived: - `RETURNED` when
`returned_at` is not null. - `OVERDUE` when `returned_at` is null and
`due_date < current date`. - `BORROWED` otherwise.

If a stored status is used for convenience, ensure it cannot become
inconsistent with the dates.

### 5.2 Relationships

-   One member can have many loans.
-   One book can appear in many loans over time.
-   Each loan belongs to exactly one member.
-   Each loan refers to exactly one book.
-   A member login account links to one member record.
-   An administrator login account does not need a member record.

### 5.3 Database constraints and indexes

-   Primary keys on all tables.
-   Unique index on `members.email`.
-   Unique index on `books.isbn` where ISBN is not null/empty.
-   Foreign keys from `loans.member_id` to `members.member_id` and
    `loans.book_id` to `books.book_id`.
-   Index `loans.member_id`, `loans.book_id`, and `loans.due_date`.
-   Use restrictive delete behavior for records referenced by loans.
-   Add check constraints for non-negative copy counts and
    `available_copies <= total_copies` if supported by the database.

------------------------------------------------------------------------

## 6. Diagram Planning

Create all five diagrams before full implementation. Save
editable/source files and exported images in `docs/diagrams/`. Use
Mermaid where appropriate, or a diagramming tool such as draw.io. Keep
diagram names consistent.

### 6.1 Use Case Diagram

**File:** `docs/diagrams/use-case-diagram.png` and its editable source.

**Actors:** - Librarian / Administrator. - Registered Member.

**Librarian use cases:** - Log in. - Log out. - View dashboard. - Manage
books (Add, View, Update, Remove). - Manage members (Register, View,
Update, Remove). - Create borrowing record. - View all borrowing
records. - Process book return. - View overdue loans.

**Member use cases:** - Log in (if member authentication is
implemented). - Browse catalogue. - Search books by title. - Search
books by author. - View own borrowing history. - View current loans. -
View returned-loan history.

**Relationships / notes:** - Add, update, remove, borrow, and return use
cases require librarian authentication. - Search by title and search by
author can be shown as specializations of Search Catalogue, or as
separate use cases. - View current loans and view returned history can
be included in View Own Borrowing History. - Do not give members access
to librarian management use cases.

### 6.2 Activity Diagrams

Create separate activity diagrams for the important workflows rather
than putting every process into one crowded diagram.

**Required files:** 1. `activity-admin-login.png` 2.
`activity-add-book.png` 3. `activity-register-member.png` 4.
`activity-borrow-book.png` 5. `activity-return-book.png` 6.
`activity-search-catalogue.png` 7. `activity-view-member-history.png`

**Borrow-book activity flow:** 1. Librarian opens Borrow Book. 2. System
displays member and book selection. 3. Librarian selects a member and a
book. 4. System validates both records. 5. System checks
`available_copies > 0`. 6. If no copy is available, show an error and
stop. 7. If available, validate borrowing and due dates. 8. Begin
database transaction. 9. Create loan record. 10. Decrease available
copies by one. 11. Commit transaction. 12. Show success confirmation and
updated availability.

**Return-book activity flow:** 1. Librarian opens active loans. 2.
Librarian selects a loan to return. 3. System verifies that the loan
exists and is not already returned. 4. Begin database transaction. 5.
Set `returned_at` to the current date/time. 6. Increase available copies
by one. 7. Commit transaction. 8. Show success confirmation and updated
availability.

### 6.3 Data Flow Diagrams (DFD)

Create: - **Context Diagram (Level 0)** --- the LMS as one process. -
**Level 1 DFD** --- decomposes the LMS into its major processes.

**External entities:** - Librarian. - Registered Member.

**Level 0 data flows:** - Librarian sends login credentials, book/member
updates, borrowing requests, and return requests. - LMS returns
authentication result, dashboard data, book/member lists, loan lists,
and overdue information. - Member sends catalogue search requests and
history requests. - LMS returns catalogue results, availability, and
that member's borrowing history.

**Level 1 processes:** 1.0 Authenticate User. 2.0 Manage Books. 3.0
Manage Members. 4.0 Browse and Search Catalogue. 5.0 Manage Borrowing.
6.0 Process Returns. 7.0 Generate Dashboard and Overdue Reports. 8.0
Retrieve Member History.

**Data stores:** - D1 Users. - D2 Books. - D3 Members. - D4 Loans.

**DFD rules:** - Label every arrow with the data being transferred. -
Data must flow through a process; do not draw direct
external-entity-to-data-store flows. - Use consistent process numbering
and data-store IDs. - Ensure Level 1 processes balance with the context
diagram.

### 6.4 Class Diagram

**File:** `docs/diagrams/class-diagram.png` and editable source.

Suggested classes:

**User** - userId - username - passwordHash - role - authenticate() -
logout()

**Book** - bookId - title - author - category - isbn - totalCopies -
availableCopies - addBook() - updateBook() - isAvailable()

**Member** - memberId - fullName - email - phone - registrationDate -
viewBorrowingHistory()

**Loan** - loanId - borrowedAt - dueDate - returnedAt - getStatus() -
markReturned()

**AuthService** - login() - logout() - authorizeRole()

**BookService** - createBook() - updateBook() - deleteBook() -
searchBooks()

**MemberService** - registerMember() - updateMember() - deleteMember()

**LoanService** - borrowBook() - returnBook() - getOverdueLoans() -
getMemberHistory()

**DashboardService** - getSummary()

**Relationships:** - Member `1` --- `0..*` Loan. - Book `1` --- `0..*`
Loan. - User `0..1` --- `1` Member for member login accounts; admin
users have no member link. - Services depend on the relevant
entity/repository classes. - Show multiplicities and important method
responsibilities.

Keep the class diagram aligned with the actual code. Do not add classes
or attributes that are not used.

### 6.5 Entity Relationship (ER) Diagram

**File:** `docs/diagrams/er-diagram.png` and editable source.

Entities: - USERS - BOOKS - MEMBERS - LOANS

Show: - Primary keys (PK). - Foreign keys (FK). - Unique fields. -
One-to-many relationships from MEMBERS to LOANS and BOOKS to LOANS. -
Optional one-to-one/one-to-zero-or-one relationship between USERS and
MEMBERS for member login accounts.

The ER diagram must match the actual database schema and migrations. Use
crow's-foot notation and mark optional fields/relationships clearly.

### 6.6 Diagram review checklist

-   [ ] All five requested diagram types are present: Use Case,
    Activity, DFD, Class, ER.
-   [ ] Activity diagrams cover borrowing and returning at minimum.
-   [ ] Actors and permissions match the functional requirements.
-   [ ] Book availability changes are shown in borrow and return flows.
-   [ ] DFD data stores match the database entities.
-   [ ] Class diagram relationships and multiplicities are correct.
-   [ ] ER diagram PK/FK constraints match the database schema.
-   [ ] Diagram labels are readable and consistent.
-   [ ] Source/editable files and exported images are saved in
    `docs/diagrams/`.

------------------------------------------------------------------------

## 7. API Design Plan

Use REST conventions. All routes should return consistent JSON and
suitable HTTP status codes. Prefix routes with `/api`.

### 7.1 Authentication

  Method   Endpoint             Purpose                        Access
  -------- -------------------- ------------------------------ ---------------
  POST     `/api/auth/login`    Authenticate user              Public
  POST     `/api/auth/logout`   End session                    Authenticated
  GET      `/api/auth/me`       Return current user and role   Authenticated

### 7.2 Books

  Method   Endpoint           Purpose                 Access
  -------- ------------------ ----------------------- ---------------
  GET      `/api/books`       List/search catalogue   Authenticated
  GET      `/api/books/:id`   Get book details        Authenticated
  POST     `/api/books`       Create book             Admin
  PUT      `/api/books/:id`   Update book             Admin
  DELETE   `/api/books/:id`   Remove/archive book     Admin

Suggested query parameters for `GET /api/books`: - `search`: search
title or author. - `title`: title-only search. - `author`: author-only
search. - `page`, `limit`: optional pagination.

### 7.3 Members

  Method   Endpoint             Purpose                 Access
  -------- -------------------- ----------------------- --------
  GET      `/api/members`       List members            Admin
  GET      `/api/members/:id`   Get member details      Admin
  POST     `/api/members`       Register member         Admin
  PUT      `/api/members/:id`   Update member           Admin
  DELETE   `/api/members/:id`   Remove/archive member   Admin

### 7.4 Loans and returns

  -------------------------------------------------------------------------------
  Method            Endpoint                  Purpose           Access
  ----------------- ------------------------- ----------------- -----------------
  GET               `/api/loans`              List all loans;   Admin
                                              support status    
                                              filters           

  GET               `/api/loans/overdue`      List overdue      Admin
                                              loans             

  POST              `/api/loans`              Borrow a book /   Admin
                                              create loan       

  PATCH             `/api/loans/:id/return`   Return a book     Admin

  GET               `/api/members/me/loans`   Current member's  Member
                                              own loan history  
  -------------------------------------------------------------------------------

### 7.5 Dashboard

  Method   Endpoint                   Purpose                   Access
  -------- -------------------------- ------------------------- --------
  GET      `/api/dashboard/summary`   Return dashboard counts   Admin

### 7.6 API response and error conventions

Use a consistent response shape, for example:

``` json
{
  "success": true,
  "message": "Book created successfully",
  "data": {}
}
```

For errors, return a clear message and appropriate status: - `400` ---
validation error or invalid request. - `401` --- not authenticated. -
`403` --- authenticated but not authorized. - `404` --- record not
found. - `409` --- conflict, such as duplicate ISBN/email or no
available copy. - `500` --- unexpected server error.

Never return password hashes or sensitive authentication data in API
responses.

------------------------------------------------------------------------

## 8. Frontend Pages and UI Plan

### 8.1 Shared UI

-   Responsive application layout.
-   Header/navigation.
-   Sidebar for administrator pages.
-   Loading indicators.
-   Empty states.
-   Form validation messages.
-   Success/error notifications.
-   Confirmation dialog before destructive actions.
-   Consistent buttons, tables, cards, and typography.

### 8.2 Administrator pages

  -----------------------------------------------------------------------
  Page                                Main content and actions
  ----------------------------------- -----------------------------------
  Admin Login                         Username/email and password form;
                                      validation and error state.

  Dashboard                           Four required summary cards: total
                                      books, total members, currently
                                      borrowed, overdue loans.

  Manage Books                        Book table, search, Add Book, Edit,
                                      Remove/Archive.

  Add/Edit Book                       Title, author, category, ISBN,
                                      total copies; show available copies
                                      appropriately.

  Manage Members                      Member table, search, Register,
                                      Edit, Remove/Archive.

  Add/Edit Member                     Full name, email, phone,
                                      registration date.

  Borrow Book                         Select member, select available
                                      book, borrowing date, expected
                                      return date.

  Borrowing Records                   Table of all loans with member,
                                      book, dates, and status filters.

  Return Book                         Select an active loan and confirm
                                      return.

  Overdue Books                       Table of overdue active loans with
                                      member and book details.
  -----------------------------------------------------------------------

### 8.3 Member pages

  -----------------------------------------------------------------------
  Page                                Main content and actions
  ----------------------------------- -----------------------------------
  Member Login                        Secure member authentication, if
                                      member accounts are part of the
                                      implementation.

  Book Catalogue                      Browse books and see available-copy
                                      information.

  Search Results                      Search by title or author; show
                                      empty state if no match.

  My Borrowing History                Separate current loans and returned
                                      loans; show dates and status.
  -----------------------------------------------------------------------

### 8.4 UI/UX expectations

-   Use a clean, modern, university-library visual style.
-   Ensure mobile, tablet, and desktop responsiveness.
-   Use readable typography and sufficient color contrast.
-   Make unavailable books visually clear.
-   Disable or explain actions that cannot be completed.
-   Use accessible labels for form fields.
-   Tables should remain usable on smaller screens (responsive layout or
    horizontal scrolling).
-   Do not use dummy dashboard counts once backend integration is
    complete.

------------------------------------------------------------------------

## 9. Full Implementation Plan --- Recommended Order

Implement incrementally. Complete and test each phase before moving to
the next.

### Phase 1 --- Requirement and repository setup

1.  Read this planning document fully.
2.  Confirm the chosen stack and database.
3.  Create the Git repository.
4.  Create `client`, `server`, and `docs/diagrams` directories.
5.  Add `.gitignore` for dependencies, environment files, build output,
    and secrets.
6.  Add a README with project purpose, setup instructions, and
    team/contributor details if applicable.
7.  Create a task checklist based on the FR IDs.

**Deliverable:** Clean project skeleton committed to Git.

### Phase 2 --- System diagrams

1.  Create the Use Case Diagram.
2.  Create the Activity Diagrams for login, add book, register member,
    borrow, return, search, and history.
3.  Create the Context (Level 0) DFD.
4.  Create the Level 1 DFD.
5.  Create the Class Diagram.
6.  Create the ER Diagram.
7.  Review diagrams against Sections 2 and 5.
8.  Save editable sources and exported images under `docs/diagrams/`.

**Deliverable:** Complete, reviewed diagram set.

### Phase 3 --- Database and backend foundation

1.  Configure the database connection using environment variables.
2.  Define the `users`, `books`, `members`, and `loans` schema.
3.  Add PKs, FKs, unique constraints, indexes, and copy-count
    constraints.
4.  Create and run migrations.
5.  Add seed data for development only.
6.  Create a secure administrator setup/seed process.
7.  Implement centralized error handling and request validation.
8.  Test database connectivity and migrations.

**Deliverable:** Working backend foundation and database.

### Phase 4 --- Authentication and authorization

1.  Implement login.
2.  Hash and verify passwords securely.
3.  Implement logout and current-user endpoint.
4.  Add authentication middleware.
5.  Add role-based middleware for admin-only endpoints.
6.  Add member ownership checks for history.
7.  Test unauthenticated, admin, and member access.

**Deliverable:** Secure login and role restrictions.

### Phase 5 --- Book management

1.  Implement book list and detail endpoints.
2.  Implement create, update, and delete/archive endpoints.
3.  Add server-side validation and duplicate ISBN handling.
4.  Build book list, add, edit, and delete-confirmation UI.
5.  Integrate frontend with APIs.
6.  Test all book CRUD cases, including invalid copies and active-loan
    deletion.

**Deliverable:** Complete book management.

### Phase 6 --- Member management

1.  Implement member list and detail endpoints.
2.  Implement register, update, and remove/archive endpoints.
3.  Add email uniqueness and field validation.
4.  Build member list and member forms.
5.  Integrate frontend with APIs.
6.  Test duplicate email and active-loan deletion rules.

**Deliverable:** Complete member management.

### Phase 7 --- Catalogue and search

1.  Implement authenticated catalogue endpoint.
2.  Implement title and author search.
3.  Add partial, case-insensitive matching where supported.
4.  Build catalogue and search UI.
5.  Show availability clearly.
6.  Test empty results and books with zero available copies.

**Deliverable:** Member catalogue and search.

### Phase 8 --- Borrowing workflow

1.  Implement endpoint to list eligible members/books as needed.
2.  Build borrow form.
3.  Validate member, book, available copies, and dates on the server.
4.  Implement atomic loan creation and copy decrement.
5.  Prevent concurrent borrowing of the final copy.
6.  Show clear success and failure messages.
7.  Build borrowing-record list.
8.  Test no-copy, invalid-member, invalid-book, and concurrent-borrow
    cases.

**Deliverable:** Reliable borrowing process.

### Phase 9 --- Return and overdue workflow

1.  Implement active-loan listing and filters.
2.  Implement atomic return operation.
3.  Set actual return date and increment available copies exactly once.
4.  Implement overdue query based on due date and return date.
5.  Build return UI and overdue list.
6.  Test duplicate return, already-returned loans, on-time returns, and
    overdue loans.

**Deliverable:** Reliable return and overdue management.

### Phase 10 --- Member history

1.  Implement `/api/members/me/loans`.
2.  Derive the member ID from the authenticated user.
3.  Return current, overdue, and returned loan records.
4.  Build My Borrowing History page.
5.  Test that one member cannot access another member's history.

**Deliverable:** Private member borrowing history.

### Phase 11 --- Dashboard

1.  Implement aggregate queries for the four dashboard metrics.
2.  Define counting rules consistently with Section 2.9.
3.  Build dashboard cards.
4.  Connect cards to live backend data.
5.  Test dashboard values against known sample records.

**Deliverable:** Live librarian dashboard.

### Phase 12 --- Integration, testing, and refinement

1.  Test complete workflows from UI to database.
2.  Check all FR IDs against implementation.
3.  Fix validation, authorization, and transaction issues.
4.  Test responsive layouts.
5.  Add loading, empty, success, and error states.
6.  Remove development-only data and debug output.
7.  Review accessibility and usability.
8.  Capture final screenshots for project documentation.

**Deliverable:** Stable, integrated application.

### Phase 13 --- Documentation and handover

1.  Write installation and setup instructions.
2.  Document environment variables without exposing secrets.
3.  Document database migration and seed commands.
4.  Document administrator setup.
5.  Document API endpoints.
6.  Add diagrams and screenshots.
7.  Add known limitations and future enhancements.
8.  Verify that another developer can run the project using only the
    README.

**Deliverable:** Submission-ready project and documentation.

------------------------------------------------------------------------

## 10. Testing Plan

### 10.1 Functional test cases

  -----------------------------------------------------------------------
  Test ID                 Scenario                Expected result
  ----------------------- ----------------------- -----------------------
  TC-01                   Login with valid        Admin dashboard opens.
                          administrator           
                          credentials             

  TC-02                   Login with invalid      Login rejected with a
                          credentials             safe error message.

  TC-03                   Open admin route        Request is
                          without login           redirected/rejected.

  TC-04                   Member attempts an      Server returns
                          admin API               forbidden response.

  TC-05                   Add a valid book        Book is saved and
                                                  appears in the list.

  TC-06                   Add a book with missing Validation errors are
                          required fields         shown.

  TC-07                   Add duplicate ISBN      Duplicate is rejected.

  TC-08                   Update a book           Updated information
                                                  appears.

  TC-09                   Delete a book with no   Book is removed or
                          loan history            archived according to
                                                  policy.

  TC-10                   Delete a book with an   Operation is blocked or
                          active loan             safely archived without
                                                  breaking history.

  TC-11                   Register a valid member Member is saved and
                                                  appears in the list.

  TC-12                   Register duplicate      Duplicate is rejected.
                          email                   

  TC-13                   Update a member         Updated details appear.

  TC-14                   Remove member with      Operation is blocked or
                          active loan             safely archived.

  TC-15                   Search by full/partial  Matching books appear.
                          title                   

  TC-16                   Search by full/partial  Matching books appear.
                          author                  

  TC-17                   Borrow a book with      Loan is created and
                          available copies        available copies
                                                  decrease by one.

  TC-18                   Borrow a book with zero Borrowing is rejected;
                          available copies        count remains zero.

  TC-19                   Attempt simultaneous    Only one request
                          borrowing of the final  succeeds.
                          copy                    

  TC-20                   Return an active loan   Return date is saved
                                                  and available copies
                                                  increase by one.

  TC-21                   Return the same loan    Second return is
                          twice                   rejected; count is not
                                                  increased again.

  TC-22                   Loan passes due date    Loan appears as
                          without return          overdue.

  TC-23                   Return an overdue loan  Loan becomes returned
                                                  and is no longer in the
                                                  overdue list.

  TC-24                   Member views their      Only their own current
                          history                 and returned loans
                                                  appear.

  TC-25                   Member tries to access  Access is denied.
                          another member's        
                          history                 

  TC-26                   Dashboard opens         All four summary counts
                                                  match database records.

  TC-27                   Open pages on           Layout remains usable.
                          mobile/tablet/desktop   
  -----------------------------------------------------------------------

### 10.2 Non-functional requirements

  -----------------------------------------------------------------------
  ID                                  Requirement
  ----------------------------------- -----------------------------------
  NFR-01                              Usability: interfaces should be
                                      simple and understandable for
                                      librarians and members.

  NFR-02                              Responsiveness: pages should work
                                      on desktop, tablet, and mobile
                                      screens.

  NFR-03                              Security: passwords must be hashed
                                      and protected routes must be
                                      enforced on the server.

  NFR-04                              Data integrity: borrowing and
                                      return operations must not produce
                                      incorrect copy counts.

  NFR-05                              Performance: common catalogue and
                                      list queries should return
                                      efficiently for the expected
                                      university-library dataset.

  NFR-06                              Reliability: validation and error
                                      handling should prevent invalid or
                                      partial operations.

  NFR-07                              Maintainability: code should be
                                      organized into reusable components
                                      and clear backend layers.

  NFR-08                              Compatibility: support current
                                      versions of common modern browsers.

  NFR-09                              Accessibility: forms, buttons,
                                      tables, and navigation should have
                                      readable labels and keyboard
                                      support.

  NFR-10                              Privacy: members must only see
                                      their own borrowing records.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 11. Git and Team Workflow

1.  Commit the planning document and diagrams to GitHub.
2.  Use meaningful branch names, such as `feature/auth`,
    `feature/book-management`, and `feature/loan-workflow`.
3.  Keep `main` stable; merge completed work through pull requests.
4.  Commit small, working changes with descriptive messages.
5.  Never commit `.env`, passwords, database credentials, or real member
    data.
6.  Keep diagrams in `docs/diagrams/` so they are version-controlled
    with the application.
7.  Update this plan if an approved requirement changes.
8.  Before merging, run relevant tests and review the changed files.

------------------------------------------------------------------------

## 12. Definition of Done

The project is ready for submission only when:

-   [ ] Librarian can log in and log out.
-   [ ] Unauthorized users cannot access administrator functions.
-   [ ] Librarian can add, view, update, and safely remove/archive
    books.
-   [ ] Librarian can register, view, update, and safely remove/archive
    members.
-   [ ] Members can browse and search books by title and author.
-   [ ] A book can be borrowed only when a copy is available.
-   [ ] Borrowing creates a loan record and decreases availability
    exactly once.
-   [ ] Returning records the return date and increases availability
    exactly once.
-   [ ] Librarian can view all loans and overdue loans.
-   [ ] Members can view only their own current and returned borrowing
    history.
-   [ ] Dashboard displays all four required metrics from live data.
-   [ ] All required diagrams are complete and consistent with the
    implementation.
-   [ ] Core functional test cases pass.
-   [ ] Application is responsive and has useful loading, empty, and
    error states.
-   [ ] README contains complete setup and run instructions.
-   [ ] No secrets or real private member data are committed to GitHub.

------------------------------------------------------------------------

## 13. Instructions for the AI Coding Agent (Antigravity)

Treat this document as the authoritative project specification.

1.  **Inspect before editing:** Check the existing repository and
    preserve any working code. Do not overwrite an existing project
    without understanding it.
2.  **Plan first:** Convert the phases above into a practical task
    checklist. Identify dependencies before implementation.
3.  **Create diagrams before full coding:** Save both editable diagram
    sources and exported images in `docs/diagrams/`.
4.  **Implement in phases:** Do not attempt to generate the entire
    application in one unreviewed step. Finish a phase, run it, test it,
    and then continue.
5.  **Use real persistence:** Use the configured database for all books,
    members, users, and loans. Do not rely on browser local storage or
    hard-coded arrays as the final data source.
6.  **Connect the full stack:** Every form and action must call the
    backend and persist changes in the database.
7.  **Enforce security on the backend:** Frontend route guards are not
    sufficient. Validate authentication, role, and member ownership on
    every protected API.
8.  **Protect data integrity:** Borrow and return operations must use
    database transactions and prevent duplicate returns or negative
    availability.
9.  **Handle edge cases:** Follow the business rules and test cases in
    this document.
10. **Keep the UI consistent:** Build reusable components and responsive
    pages. Include loading, empty, success, and error states.
11. **Do not invent requirements:** If a requirement is
    ambiguous---especially member login, copy-count semantics, or
    deletion policy---record the assumption and ask for clarification
    rather than silently changing scope.
12. **Keep documentation current:** Update README, API documentation,
    diagrams, and this checklist as implementation decisions are
    finalized.
13. **Report progress clearly:** At the end of each phase, summarize
    files created/changed, tests run, test results, and remaining tasks.
14. **Do not claim completion without verification:** Run the
    application and relevant tests. Fix errors before marking a phase
    complete.

**First action:** Inspect the repository, confirm the available runtime
and database setup, then create a phase-by-phase implementation
checklist. Do not start by generating all application code at once.
