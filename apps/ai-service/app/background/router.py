from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.background.exceptions import BgvError
from app.background.models.schemas import BgvAnalyzeRequest, BgvAnalysisResponse
from app.background.services.bgv_analysis_service import BgvAnalysisService

router = APIRouter(prefix="/api/v1/ai/background", tags=["background-verification"])


def get_bgv_analysis_service() -> BgvAnalysisService:
    return BgvAnalysisService()


@router.post("/analyze", response_model=BgvAnalysisResponse)
async def analyze_background_check(
    request: BgvAnalyzeRequest,
    service: BgvAnalysisService = Depends(get_bgv_analysis_service),
):
    if not request.file_name.strip():
        return JSONResponse(status_code=400, content={"detail": "fileName is required."})

    if not request.content.strip():
        return JSONResponse(status_code=400, content={"detail": "content is required."})

    try:
        return await service.analyze(request)
    except BgvError as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})
