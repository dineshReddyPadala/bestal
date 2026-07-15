import json
from datetime import datetime, timezone
from uuid import uuid4

from app.models.schemas import ResumeAnalysisResponse


class ResponseFormatter:
    def parse(self, raw_response: str, job_id: str | None = None) -> ResumeAnalysisResponse:
        payload = self._extract_json(raw_response)
        normalized = self._normalize_keys(payload, job_id=job_id)
        return ResumeAnalysisResponse.model_validate(normalized)

    def _extract_json(self, raw_response: str) -> dict:
        content = raw_response.strip()
        if content.startswith("```"):
            content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(content)

    def _normalize_keys(self, payload: dict, job_id: str | None = None) -> dict:
        candidate = payload.get("candidate", {}) or {}
        raw_sections = payload.get("rawSections", {}) or {}

        skills = []
        seen_skills: set[str] = set()
        for item in payload.get("skills", []) or []:
            if isinstance(item, str):
                skill_name = item.strip()
                key = skill_name.lower()
                if not skill_name or key in seen_skills:
                    continue
                seen_skills.add(key)
                skills.append(
                    {
                        "name": skill_name,
                        "proficiency_level": "INTERMEDIATE",
                        "years_experience": None,
                        "is_primary": False,
                    }
                )
                continue

            skill_name = (item.get("name") or "").strip()
            key = skill_name.lower()
            if not skill_name or key in seen_skills:
                continue
            seen_skills.add(key)
            skills.append(
                {
                    "name": skill_name,
                    "proficiency_level": item.get("proficiencyLevel", "INTERMEDIATE"),
                    "years_experience": item.get("yearsExperience"),
                    "is_primary": bool(item.get("isPrimary", False)),
                }
            )

        experience = [
            {
                "company": item.get("company", ""),
                "title": item.get("title", ""),
                "start_date": item.get("startDate"),
                "end_date": item.get("endDate"),
                "description": item.get("description", ""),
            }
            for item in payload.get("experience", []) or []
            if isinstance(item, dict)
        ]

        education = [
            {
                "institution": item.get("institution", ""),
                "degree": item.get("degree", ""),
                "field_of_study": item.get("fieldOfStudy"),
                "graduation_year": item.get("graduationYear"),
            }
            for item in payload.get("education", []) or []
            if isinstance(item, dict)
        ]

        return {
            "job_id": job_id or payload.get("jobId") or str(uuid4()),
            "confidence": float(payload.get("confidence") or 0.0),
            "extracted_at": datetime.now(timezone.utc),
            "warnings": payload.get("warnings", []) or [],
            "candidate": {
                "first_name": candidate.get("firstName", "") or "",
                "last_name": candidate.get("lastName", "") or "",
                "email": candidate.get("email"),
                "phone": candidate.get("phone"),
                "location": candidate.get("location"),
                "linkedin_url": candidate.get("linkedinUrl"),
                "headline": candidate.get("headline"),
                "summary": candidate.get("summary", "") or "",
                "years_experience": candidate.get("yearsExperience"),
            },
            "primary_role": payload.get("primaryRole", "") or "",
            "seniority": payload.get("seniority", "") or "",
            "community": payload.get("community", "") or "",
            "skills": skills,
            "experience": experience,
            "education": education,
            "ai_summary": payload.get("aiSummary", "") or "",
            "strengths": payload.get("strengths", "") or "",
            "weaknesses": payload.get("weaknesses", "") or "",
            "risk_flags": payload.get("riskFlags", "") or "",
            "bestal_score": self._normalize_bestal_score(payload.get("bestalScore")),
            "recommended_client_rate": self._optional_number(payload.get("recommendedClientRate")),
            "recommended_candidate_rate": self._optional_number(
                payload.get("recommendedCandidateRate")
            ),
            "raw_sections": {
                "summary": raw_sections.get("summary", "") or "",
                "skills": raw_sections.get("skills", "") or "",
                "experience": raw_sections.get("experience", "") or "",
                "education": raw_sections.get("education", "") or "",
            },
        }

    def _normalize_bestal_score(self, value) -> int:
        # New contract: integer. Also accept legacy { score, reason } objects.
        if isinstance(value, dict):
            value = value.get("score", 0)
        try:
            return max(0, min(100, int(float(value or 0))))
        except (TypeError, ValueError):
            return 0

    def _optional_number(self, value) -> float | None:
        if value is None or value == "":
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None
