from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.app.database import get_db
from server.app.models.user import User
from server.app.schemas.dashboard import DashboardSummaryOut
from server.app.schemas.common import ApiResponse
from server.app.services.dashboard_service import DashboardService
from server.app.dependencies import require_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=ApiResponse[DashboardSummaryOut])
def get_dashboard_summary(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    summary = DashboardService.get_summary(db)
    return ApiResponse(
        success=True,
        message="Dashboard summary retrieved successfully",
        data=summary
    )
