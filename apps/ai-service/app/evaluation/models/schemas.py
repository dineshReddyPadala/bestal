from datetime import date, datetime, timezone
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class EvaluateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    file_name: str = Field(..., alias="fileName")
    mime_type: str = Field(..., alias="mimeType")
    content: str
    job_id: Optional[str] = Field(None, alias="jobId")
    candidate_id: Optional[str] = Field(None, alias="candidateId")


class EvaluationResponse(BaseModel):
    """Persistence-ready evaluation extraction — camelCase JSON for BesTal Node/web."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    id: str = Field(default_factory=lambda: str(uuid4()))
    candidate_id: Optional[str] = Field(None, serialization_alias="candidateId")
    evaluator_name: str = Field("", serialization_alias="evaluatorName")
    evaluator_company: str = Field("", serialization_alias="evaluatorCompany")
    evaluation_type: str = Field("", serialization_alias="evaluationType")
    evaluation_date: Optional[date] = Field(None, serialization_alias="evaluationDate")

    technical_score: int = Field(0, serialization_alias="technicalScore")
    communication_score: int = Field(0, serialization_alias="communicationScore")
    problem_solving_score: int = Field(0, serialization_alias="problemSolvingScore")
    architecture_score: int = Field(0, serialization_alias="architectureScore")
    client_readiness_score: int = Field(0, serialization_alias="clientReadinessScore")

    recommendation: str = ""
    evaluator_comments: str = Field("", serialization_alias="evaluatorComments")
    ai_evaluation_summary: str = Field("", serialization_alias="aiEvaluationSummary")

    recording_url: Optional[str] = Field(None, serialization_alias="recordingUrl")
    evaluation_file_url: Optional[str] = Field(None, serialization_alias="evaluationFileUrl")

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        serialization_alias="createdAt",
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        serialization_alias="updatedAt",
    )

    job_id: Optional[str] = Field(None, serialization_alias="jobId")
    confidence: float = 0.85
    extracted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        serialization_alias="extractedAt",
    )
    warnings: list[str] = Field(default_factory=list)
