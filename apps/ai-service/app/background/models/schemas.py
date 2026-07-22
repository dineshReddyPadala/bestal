from datetime import date, datetime, timezone
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class BgvAnalyzeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    file_name: str = Field(..., alias="fileName")
    mime_type: str = Field(..., alias="mimeType")
    content: str
    job_id: Optional[str] = Field(None, alias="jobId")
    candidate_id: Optional[str] = Field(None, alias="candidateId")


class BgvAnalysisResponse(BaseModel):
    """Background check extraction shape for BesTal Node/web (camelCase JSON)."""

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    id: str = Field(default_factory=lambda: str(uuid4()))
    candidate_id: Optional[str] = Field(None, serialization_alias="candidateId")
    vendor_name: str = Field("", serialization_alias="vendorName")
    status: str = ""

    id_check_status: str = Field("", serialization_alias="idCheckStatus")
    address_check_status: str = Field("", serialization_alias="addressCheckStatus")
    employment_check_status: str = Field("", serialization_alias="employmentCheckStatus")
    education_check_status: str = Field("", serialization_alias="educationCheckStatus")
    criminal_check_status: str = Field("", serialization_alias="criminalCheckStatus")
    reference_check_status: str = Field("", serialization_alias="referenceCheckStatus")

    report_url: Optional[str] = Field(None, serialization_alias="reportUrl")
    ai_bgv_summary: str = Field("", serialization_alias="aiBgvSummary")
    concern_notes: str = Field("", serialization_alias="concernNotes")

    initiated_date: Optional[date] = Field(None, serialization_alias="initiatedDate")
    completed_date: Optional[date] = Field(None, serialization_alias="completedDate")

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
    # Optional BesTal enum hint for create form
    check_type: str = Field("COMPREHENSIVE", serialization_alias="checkType")
