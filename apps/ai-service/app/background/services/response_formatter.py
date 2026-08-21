import json
from datetime import date, datetime, timezone
from uuid import uuid4

from app.background.models.schemas import BgvAnalysisResponse


class ResponseFormatter:
    def parse(
        self,
        raw_response: str,
        *,
        job_id: str | None = None,
        candidate_id: str | None = None,
        bgv_id: str | None = None,
    ) -> BgvAnalysisResponse:
        payload = self._extract_json(raw_response)
        normalized = self._normalize_keys(
            payload,
            job_id=job_id,
            candidate_id=candidate_id,
            bgv_id=bgv_id,
        )
        return BgvAnalysisResponse.model_validate(normalized)

    def _extract_json(self, raw_response: str) -> dict:
        content = raw_response.strip()
        if content.startswith("```"):
            content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(content)

    def _normalize_keys(
        self,
        payload: dict,
        *,
        job_id: str | None = None,
        candidate_id: str | None = None,
        bgv_id: str | None = None,
    ) -> dict:
        now = datetime.now(timezone.utc)
        return {
            "id": bgv_id or str(uuid4()),
            "candidate_id": candidate_id or payload.get("candidate_id") or payload.get("candidateId"),
            "vendor_name": (payload.get("vendor_name") or payload.get("vendorName") or "").strip(),
            "status": (payload.get("status") or "").strip() or "PENDING",
            "id_check_status": self._status(
                payload.get("id_check_status") or payload.get("idCheckStatus")
            ),
            "employment_check_status": self._status(
                payload.get("employment_check_status") or payload.get("employmentCheckStatus")
            ),
            "criminal_check_status": self._status(
                payload.get("criminal_check_status") or payload.get("criminalCheckStatus")
            ),
            "report_url": self._optional_url(payload.get("report_url") or payload.get("reportUrl")),
            "ai_bgv_summary": (
                payload.get("ai_bgv_summary") or payload.get("aiBgvSummary") or ""
            ).strip(),
            "concern_notes": (
                payload.get("concern_notes") or payload.get("concernNotes") or ""
            ).strip(),
            "initiated_date": self._normalize_date(
                payload.get("initiated_date") or payload.get("initiatedDate")
            ),
            "completed_date": self._normalize_date(
                payload.get("completed_date") or payload.get("completedDate")
            ),
            "created_at": now,
            "updated_at": now,
            "job_id": job_id or payload.get("jobId") or payload.get("job_id"),
            "confidence": float(payload.get("confidence") or 0.85),
            "extracted_at": now,
            "warnings": payload.get("warnings")
            if isinstance(payload.get("warnings"), list)
            else [],
            "check_type": (
                payload.get("check_type") or payload.get("checkType") or "COMPREHENSIVE"
            ).strip().upper()
            or "COMPREHENSIVE",
        }

    def _status(self, value) -> str:
        if value is None:
            return "NOT_STARTED"
        text = str(value).strip()
        return text or "NOT_STARTED"

    def _normalize_date(self, value) -> date | None:
        if value is None or value == "":
            return None
        if isinstance(value, date) and not isinstance(value, datetime):
            return value
        text = str(value).strip()
        try:
            return date.fromisoformat(text[:10])
        except ValueError:
            return None

    def _optional_url(self, value) -> str | None:
        if value is None:
            return None
        text = str(value).strip()
        return text or None
