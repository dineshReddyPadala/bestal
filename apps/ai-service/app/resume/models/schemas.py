from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class ResumeAnalyzeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    file_name: str = Field(..., alias="fileName")
    mime_type: str = Field(..., alias="mimeType")
    content: str
    job_id: Optional[str] = Field(None, alias="jobId")


class CandidateInfo(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    first_name: str = Field("", serialization_alias="firstName")
    last_name: str = Field("", serialization_alias="lastName")
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = Field(None, serialization_alias="linkedinUrl")
    headline: Optional[str] = None
    summary: str = ""
    years_experience: Optional[float] = Field(None, serialization_alias="yearsExperience")


class SkillItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    name: str = ""
    proficiency_level: str = Field("INTERMEDIATE", serialization_alias="proficiencyLevel")
    years_experience: Optional[float] = Field(None, serialization_alias="yearsExperience")
    is_primary: bool = Field(False, serialization_alias="isPrimary")


class ExperienceItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    company: str = ""
    title: str = ""
    start_date: Optional[str] = Field(None, serialization_alias="startDate")
    end_date: Optional[str] = Field(None, serialization_alias="endDate")
    description: str = ""


class EducationItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    institution: str = ""
    degree: str = ""
    field_of_study: Optional[str] = Field(None, serialization_alias="fieldOfStudy")
    graduation_year: Optional[int] = Field(None, serialization_alias="graduationYear")


class RawSections(BaseModel):
    summary: str = ""
    skills: str = ""
    experience: str = ""
    education: str = ""


class ResumeAnalysisResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)

    job_id: str = Field(default_factory=lambda: str(uuid4()), serialization_alias="jobId")
    confidence: float = 0.0
    extracted_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        serialization_alias="extractedAt",
    )
    warnings: list[str] = Field(default_factory=list)
    candidate: CandidateInfo = Field(default_factory=CandidateInfo)
    primary_role: str = Field("", serialization_alias="primaryRole")
    seniority: str = ""
    community: str = ""
    skills: list[SkillItem] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    ai_summary: str = Field("", serialization_alias="aiSummary")
    strengths: str = ""
    weaknesses: str = ""
    risk_flags: str = Field("", serialization_alias="riskFlags")
    bestal_score: int = Field(0, serialization_alias="bestalScore")
    recommended_client_rate: Optional[float] = Field(
        None, serialization_alias="recommendedClientRate"
    )
    recommended_candidate_rate: Optional[float] = Field(
        None, serialization_alias="recommendedCandidateRate"
    )
    raw_sections: RawSections = Field(default_factory=RawSections, serialization_alias="rawSections")
