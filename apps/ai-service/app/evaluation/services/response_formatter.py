import json
from datetime import date, datetime, timezone
from uuid import uuid4

from app.evaluation.models.schemas import EvaluationResponse


class ResponseFormatter:
    def parse(
        self,
        raw_response: str,
        *,
        job_id: str | None = None,
        candidate_id: str | None = None,
        evaluation_id: str | None = None,
    ) -> EvaluationResponse:
        payload = self._extract_json(raw_response)
        normalized = self._normalize_keys(
            payload,
            job_id=job_id,
            candidate_id=candidate_id,
            evaluation_id=evaluation_id,
        )
        return EvaluationResponse.model_validate(normalized)

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
        evaluation_id: str | None = None,
    ) -> dict:
        now = datetime.now(timezone.utc)
        return {
            "id": evaluation_id or str(uuid4()),
            "candidate_id": candidate_id or payload.get("candidate_id"),
            "evaluator_name": (payload.get("evaluator_name") or "").strip(),
            "evaluator_company": (payload.get("evaluator_company") or "").strip(),
            "evaluation_type": (payload.get("evaluation_type") or "").strip(),
            "evaluation_date": self._normalize_date(payload.get("evaluation_date")),
            "technical_score": self._normalize_score(payload.get("technical_score")),
            "communication_score": self._normalize_score(payload.get("communication_score")),
            "problem_solving_score": self._normalize_score(payload.get("problem_solving_score")),
            "architecture_score": self._normalize_score(payload.get("architecture_score")),
            "client_readiness_score": self._normalize_score(payload.get("client_readiness_score")),
            "recommendation": (payload.get("recommendation") or "").strip(),
            "evaluator_comments": (payload.get("evaluator_comments") or "").strip(),
            "ai_evaluation_summary": (payload.get("ai_evaluation_summary") or "").strip(),
            "recording_url": self._optional_url(payload.get("recording_url")),
            "evaluation_file_url": self._optional_url(payload.get("evaluation_file_url")),
            "created_at": now,
            "updated_at": now,
            "job_id": job_id or payload.get("jobId") or payload.get("job_id"),
            "confidence": float(payload.get("confidence") or 0.85),
            "extracted_at": now,
            "warnings": payload.get("warnings")
            if isinstance(payload.get("warnings"), list)
            else [],
        }

    def _normalize_score(self, value) -> int:
        if value is None or value == "":
            return 0
        try:
            return max(0, min(100, int(round(float(value)))))
        except (TypeError, ValueError):
            return 0

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
