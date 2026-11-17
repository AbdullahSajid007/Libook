import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from server.app.config import settings
from server.app.database import engine, Base
from server.app.routes import auth, books, members, loans, dashboard

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        from server.app.seed import seed_database
        seed_database()
    except Exception as e:
        print(f"Startup notice: {e}")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers for consistent JSON API responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "data": None
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err.get("loc", []) if loc != "body"])
        msg = err.get("msg", "Invalid value")
        error_details.append(f"{field}: {msg}" if field else msg)
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "success": False,
            "message": "Validation failed: " + "; ".join(error_details),
            "data": exc.errors()
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    err_str = str(exc)
    if "could not translate host name" in err_str or "connection" in err_str.lower():
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": (
                    "Database connection error: Could not reach the database. "
                    "Please check your DATABASE_URL environment variable in Render. "
                    "For Supabase, use the Connection Pooler URL (IPv4): "
                    "postgresql://postgres.[project-ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"
                ),
                "detail": err_str,
                "data": None
            }
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": f"Server error: {err_str}",
            "data": None
        }
    )

# Register API Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(books.router, prefix=settings.API_PREFIX)
app.include_router(members.router, prefix=settings.API_PREFIX)
app.include_router(loans.router, prefix=settings.API_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_PREFIX)

@app.api_route(f"{settings.API_PREFIX}/health", methods=["GET", "HEAD"], tags=["Health"])
def health_check():
    db_status = "ok"
    db_detail = None
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = "error"
        db_detail = str(e)

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "database_error": db_detail
    }

# Serve React static frontend in production if built
client_dist_path = os.path.join(os.path.dirname(__file__), "..", "..", "client", "dist")
if os.path.exists(client_dist_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(client_dist_path, "assets")), name="assets")

    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_spa(full_path: str):
        # Don't hijack API routes
        if full_path.startswith("api"):
            return JSONResponse(status_code=404, content={"success": False, "message": "API route not found"})
        file_path = os.path.join(client_dist_path, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(client_dist_path, "index.html"))
