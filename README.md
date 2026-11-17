# University Library Management System (Libook LMS)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg?style=flat&logo=PostgreSQL&logoColor=white)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A web-based **University Library Management System (LMS)** engineered to replace manual record keeping. Built with **PostgreSQL (Supabase)**, a **FastAPI (Python)** backend, and a modern **React (Vite + Tailwind CSS)** frontend. Fully configured for 1-click cloud deployment on **Render** and **Supabase**.

---

## 📖 Table of Contents
1. [Key Features & Role Capabilities](#-key-features--role-capabilities)
2. [Technology Stack & Architecture](#-technology-stack--architecture)
3. [System Design & Diagrams](#-system-design--diagrams)
4. [Live Demo Credentials](#-live-demo-credentials)
5. [Supabase Database Setup Guide](#-supabase-database-setup-guide)
6. [Render Deployment Guide](#-render-deployment-guide)
7. [Local Development Setup](#-local-development-setup)
8. [Automated Testing (TC-01 through TC-27)](#-automated-testing)
9. [REST API Documentation](#-rest-api-documentation)

---

## 🚀 Key Features & Role Capabilities

### 👨‍💼 Librarian / Administrator Operations
- **Secure Authentication**: Role-based JWT authentication with bcrypt password hashing.
- **Executive Dashboard**: Real-time calculations of:
  - Total book titles and physical copies count.
  - Total registered members.
  - Currently borrowed copies.
  - Overdue loans count.
- **Book Management (CRUD)**:
  - Add, update, and inspect books with titles, authors, categories, ISBNs, and copy counts.
  - Automatic `borrowed_copies = total_copies - available_copies` derivation.
  - Active loan protection: Deletion of books with active borrowings is strictly blocked.
  - Unique ISBN enforcement.
- **Member Management (CRUD)**:
  - Register student and faculty members with full name, unique email, phone, and registration date.
  - Automatically provisions student catalogue login accounts.
  - Active loan protection: Removal of members with unreturned books is strictly blocked.
- **Atomic Borrowing Workflow**:
  - Issue books to registered members with return due dates.
  - Concurrency-safe database transactions with row-level locks (`FOR UPDATE`).
  - Automatic decrement of available copy count; borrowing blocked when availability is 0.
- **Atomic Return Workflow**:
  - Locate loans and mark as returned with actual return date.
  - Automatic increment of available copy count.
  - Double return prevention (loans cannot be returned twice).
- **Overdue Loans Tracking**:
  - Real-time dynamic overdue calculation (`due_date < current_date` and `returned_at IS NULL`).
  - Days late counter badge with 1-click return processing.

### 🎓 Registered Member Portal
- **Catalogue Search & Browse**:
  - Search by title, author, or across all fields with partial, case-insensitive matching (`ILIKE`).
  - Live availability indicators (`X copies available` vs `All copies out`).
  - Category filtering.
- **Personal Borrowing History**:
  - View currently borrowed books with due dates and overdue warnings.
  - View past returned books with actual return dates.
  - Strict privacy: Member identity is derived directly from the authenticated session; accessing another member's history is forbidden.

---

## 🛠 Technology Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + Vite                      │
│            Tailwind CSS, Lucide Icons, SPA             │
└───────────────────────────▲────────────────────────────┘
                            │ REST API (JSON + Bearer JWT)
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI (Python 3.10)                 │
│       Pydantic v2, Row Locks, SQLAlchemy 2.0 ORM       │
└───────────────────────────▲────────────────────────────┘
                            │ Connection Pooler / TCP
┌───────────────────────────▼────────────────────────────┐
│             PostgreSQL (Supabase / Local)              │
│       Users, Books, Members, Loans with Constraints    │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React icons.
- **Backend**: FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, PyJWT, Bcrypt / Passlib.
- **Database**: PostgreSQL (native support for Supabase connection pooler on ports 6543/5432) with automatic SQLite zero-config fallback for offline local testing.
- **Deployment**: Render Web Service (`render.yaml` blueprint, `render-build.sh`, and multi-stage `Dockerfile`).

---

## 📊 System Design & Diagrams

All 12 design diagrams required by **Section 6** of [planning.md](planning.md) are generated and documented in [`docs/diagrams/`](docs/diagrams/README.md):

| Diagram Type | Source File | Rendered Image |
| :--- | :--- | :--- |
| **Use Case Diagram** | [`use-case-diagram.mmd`](docs/diagrams/use-case-diagram.mmd) | [`use-case-diagram.png`](docs/diagrams/use-case-diagram.png) |
| **Admin & Member Login Activity** | [`activity-admin-login.mmd`](docs/diagrams/activity-admin-login.mmd) | [`activity-admin-login.png`](docs/diagrams/activity-admin-login.png) |
| **Add Book Activity** | [`activity-add-book.mmd`](docs/diagrams/activity-add-book.mmd) | [`activity-add-book.png`](docs/diagrams/activity-add-book.png) |
| **Register Member Activity** | [`activity-register-member.mmd`](docs/diagrams/activity-register-member.mmd) | [`activity-register-member.png`](docs/diagrams/activity-register-member.png) |
| **Borrow Book Activity** | [`activity-borrow-book.mmd`](docs/diagrams/activity-borrow-book.mmd) | [`activity-borrow-book.png`](docs/diagrams/activity-borrow-book.png) |
| **Return Book Activity** | [`activity-return-book.mmd`](docs/diagrams/activity-return-book.mmd) | [`activity-return-book.png`](docs/diagrams/activity-return-book.png) |
| **Search Catalogue Activity** | [`activity-search-catalogue.mmd`](docs/diagrams/activity-search-catalogue.mmd) | [`activity-search-catalogue.png`](docs/diagrams/activity-search-catalogue.png) |
| **View Member History Activity** | [`activity-view-member-history.mmd`](docs/diagrams/activity-view-member-history.mmd) | [`activity-view-member-history.png`](docs/diagrams/activity-view-member-history.png) |
| **Context DFD (Level 0)** | [`dfd-level-0.mmd`](docs/diagrams/dfd-level-0.mmd) | [`dfd-level-0.png`](docs/diagrams/dfd-level-0.png) |
| **Level 1 DFD** | [`dfd-level-1.mmd`](docs/diagrams/dfd-level-1.mmd) | [`dfd-level-1.png`](docs/diagrams/dfd-level-1.png) |
| **Class Diagram** | [`class-diagram.mmd`](docs/diagrams/class-diagram.mmd) | [`class-diagram.png`](docs/diagrams/class-diagram.png) |
| **Entity Relationship (ERD)** | [`er-diagram.mmd`](docs/diagrams/er-diagram.mmd) | [`er-diagram.png`](docs/diagrams/er-diagram.png) |

---

## 🔑 Live Demo Credentials

The initial seed script automatically provisions these accounts for testing:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Librarian (Admin)** | `admin` | `Admin123!` | Full admin access (dashboard, books, members, loans, overdue) |
| **Student Member** | `alice.walker` | `Member123!` | Member catalogue & personal loan history |
| **Student Member** | `bob.martinez` | `Member123!` | Member with active borrowed book |
| **Student Member** | `carol.danvers`| `Member123!` | Member with overdue loan |

*(The login screen also provides one-click Demo Login buttons for immediate access.)*

---

## 🐘 Supabase Database Setup Guide

1. Go to [supabase.com](https://supabase.com) and create a free project (e.g. `libook-database`).
2. Go to **Project Settings** (gear icon) -> **Database**.
3. Under **Connection string**, select **URI** and choose **Transaction Pooler** (recommended, port `6543`) or **Direct connection** (port `5432`).
4. Copy the connection URI:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password.
6. Provide this string as `DATABASE_URL` in your environment (in `.env` locally or in Render dashboard).

---

## 🚀 Render Deployment Guide

This repository includes a [`render.yaml`](render.yaml) blueprint and a [`render-build.sh`](render-build.sh) script for seamless deployment.

### Option 1: Blueprint 1-Click Deploy (Recommended)
1. Push this repository to your GitHub account.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Connect your GitHub repository. Render will automatically detect `render.yaml`.
4. Enter your `DATABASE_URL` from Supabase.
5. Click **Apply**. Render will automatically:
   - Build the React client into static production assets.
   - Install backend Python dependencies.
   - Initialize PostgreSQL tables and seed sample data.
   - Start the FastAPI web service on port `$PORT`.

### Option 2: Manual Web Service on Render
- **Environment**: Python 3
- **Build Command**: `./render-build.sh`
- **Start Command**: `uvicorn server.app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `DATABASE_URL`: Your Supabase connection string.
  - `JWT_SECRET`: A secure random string (e.g. 32 characters).
  - `ADMIN_DEFAULT_USERNAME`: `admin`
  - `ADMIN_DEFAULT_PASSWORD`: `Admin123!`

---

## 💻 Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Libook
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv server/venv
# Windows:
server\venv\Scripts\activate
# Linux/macOS:
# source server/venv/bin/activate

# Install dependencies
pip install -r server/requirements.txt

# (Optional) Configure .env file
# By default, if DATABASE_URL is not set, SQLite (library.db) is used automatically
copy .env.example .env

# Initialize database schema and seed accounts & books
python -m server.app.init_db

# Start FastAPI development server
uvicorn server.app.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://localhost:8000/api/docs`.

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
```
The React development server will start at `http://localhost:5173` with automatic API proxying to `http://127.0.0.1:8000`.

---

## 🧪 Automated Testing

A test suite verifying all 27 Functional Requirements (TC-01 through TC-27) is included in `server/tests/test_api.py`.

Run tests with pytest:
```bash
# Ensure virtual environment is active
$env:PYTHONPATH="."  # Windows PowerShell
# export PYTHONPATH="." # Linux/macOS

pytest server/tests/test_api.py -v
```

### Test Coverage Highlights:
- **TC-01 & TC-02**: Admin valid login & invalid credentials rejection.
- **TC-03 & TC-04**: Unauthenticated rejection (401) & member admin route forbidden (403).
- **TC-05 & TC-06**: Valid book creation & validation error rejection.
- **TC-07**: Duplicate ISBN conflict handling (409).
- **TC-08**: Book information updates.
- **TC-09 & TC-10**: Safe deletion & blocking deletion of books with active loans (409).
- **TC-11 & TC-12**: Member registration & duplicate email rejection (409).
- **TC-13 & TC-14**: Member updates & blocking deletion of members with active loans (409).
- **TC-15 & TC-16**: Case-insensitive partial search by title and author.
- **TC-17 & TC-18**: Atomic borrowing & rejection when available copies is 0 (409).
- **TC-20 & TC-21**: Atomic return, copy increment, & double-return prevention (400).
- **TC-22 & TC-23**: Dynamic overdue identification & return resolution.
- **TC-24 & TC-25**: Authenticated member private history isolation.
- **TC-26**: Live dashboard aggregations verification.

---

## 📡 REST API Documentation

All routes are prefixed with `/api` and return a standardized JSON response:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

### Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | Public |
| `POST` | `/api/auth/logout` | Invalidate / end session | Authenticated |
| `GET` | `/api/auth/me` | Current user profile | Authenticated |
| `GET` | `/api/dashboard/summary` | Live summary counts (4 metrics) | Admin |
| `GET` | `/api/books` | List & search catalogue (`search`, `title`, `author`, `category`) | Authenticated |
| `GET` | `/api/books/{id}` | Book details | Authenticated |
| `POST` | `/api/books` | Add new book record | Admin |
| `PUT` | `/api/books/{id}` | Update book details | Admin |
| `DELETE` | `/api/books/{id}` | Safely remove book (checks active loans) | Admin |
| `GET` | `/api/members` | List members with search | Admin |
| `GET` | `/api/members/{id}` | Member details | Admin |
| `POST` | `/api/members` | Register member & student account | Admin |
| `PUT` | `/api/members/{id}` | Update member details | Admin |
| `DELETE` | `/api/members/{id}` | Safely remove member (checks active loans) | Admin |
| `GET` | `/api/members/me/loans`| Authenticated member's own history | Member |
| `GET` | `/api/loans` | List loans with `status` filter (`BORROWED`, `OVERDUE`, `RETURNED`) | Admin |
| `GET` | `/api/loans/overdue` | List active overdue loans | Admin |
| `POST` | `/api/loans` | Issue / borrow book (atomic transaction) | Admin |
| `PATCH` | `/api/loans/{id}/return`| Process book return (atomic transaction) | Admin |
| `GET` | `/api/health` | Health check endpoint | Public |
