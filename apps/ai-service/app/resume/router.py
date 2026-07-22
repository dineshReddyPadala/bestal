from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.resume.exceptions import ResumeAnalysisError
from app.resume.models.schemas import ResumeAnalysisResponse, ResumeAnalyzeRequest
from app.resume.services.resume_analysis_service import ResumeAnalysisService

router = APIRouter(prefix="/api/v1/ai/resume", tags=["resume"])


def get_resume_analysis_service() -> ResumeAnalysisService:
    return ResumeAnalysisService()


@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    request: ResumeAnalyzeRequest,
    service: ResumeAnalysisService = Depends(get_resume_analysis_service),
):
    if not request.file_name.strip():
        return JSONResponse(status_code=400, content={"detail": "fileName is required."})

    if not request.content.strip():
        return JSONResponse(status_code=400, content={"detail": "content is required."})

    try:
        return await service.analyze(request)
    except ResumeAnalysisError as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})
