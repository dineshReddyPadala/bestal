import json

RESPONSE_SCHEMA = {
    "evaluator_name": "string — name of the human evaluator if present, else empty",
    "evaluator_company": "string — company of the evaluator if present, else empty",
    "evaluation_type": "string — MUST be one of: Coding Test|Live Technical Interview|System Design|Platform-Specific|Communication|Functional|Manual Scorecard",
    "evaluation_date": "YYYY-MM-DD or null if unknown",
    "technical_score": "0-100 integer",
    "communication_score": "0-100 integer",
    "problem_solving_score": "0-100 integer",
    "architecture_score": "0-100 integer",
    "client_readiness_score": "0-100 integer",
    "recommendation": "string — MUST be one of: Strong Hire|Hire|Borderline|Reject",
    "evaluator_comments": "string — key comments/notes from the evaluation document",
    "ai_evaluation_summary": "string — concise AI narrative summarizing the evaluation",
    "recording_url": "string URL or null",
    "evaluation_file_url": "string URL or null",
}


class PromptBuilder:
    def build(self, document_text: str) -> str:
        schema_json = json.dumps(RESPONSE_SCHEMA, indent=2)

        return f"""You are an expert technical interview and candidate evaluation engine.

Analyze ONLY the evaluation document text below and return ONLY valid JSON matching this schema
(snake_case keys exactly):

{schema_json}

Rules:
- Extract facts supported by the document. Do NOT invent missing details.
- Use null or empty strings when information is unavailable.
- All score fields MUST be integers from 0 to 100.
- If the document gives scores on a different scale (e.g. 1-5 or 1-10), convert proportionally to 0-100.
- If a score dimension is not mentioned, estimate conservatively from evidence in the document,
  or use 0 only when there is truly no signal — prefer evidence-based scores.
- recommendation MUST be exactly one of: Strong Hire, Hire, Borderline, Reject (map Rejected/No Hire → Reject; Hold → Borderline).
- evaluation_type MUST be exactly one of: Coding Test, Live Technical Interview, System Design, Platform-Specific, Communication, Functional, Manual Scorecard.
- evaluator_comments should preserve the evaluator's main points in plain text.
- ai_evaluation_summary should be a concise third-person AI narrative for recruiters.
- evaluation_date must be YYYY-MM-DD when a date is present; otherwise null.
- recording_url / evaluation_file_url only if explicit URLs appear in the document; else null.
- Never invent person names, companies, URLs, or dates that are not in the document.

Evaluation document text:
\"\"\"
{document_text}
\"\"\"

Return ONLY valid JSON for THIS evaluation document.
"""
