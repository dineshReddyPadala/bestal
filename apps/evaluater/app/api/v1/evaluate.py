from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.core.exceptions import EvaluationError
from app.models.schemas import EvaluateRequest, EvaluationResponse
from app.services.evaluation_service import EvaluationService

router = APIRouter(prefix="/api/v1/ai/evaluation", tags=["evaluation"])


def get_evaluation_service() -> EvaluationService:
    return EvaluationService()


@router.post("/analyze", response_model=EvaluationResponse)
async def analyze_evaluation(
    request: EvaluateRequest,
    service: EvaluationService = Depends(get_evaluation_service),
):
    if not request.file_name.strip():
        return JSONResponse(status_code=400, content={"detail": "fileName is required."})

    if not request.content.strip():
        return JSONResponse(status_code=400, content={"detail": "content is required."})

    try:
        return await service.evaluate(request)
    except EvaluationError as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})
