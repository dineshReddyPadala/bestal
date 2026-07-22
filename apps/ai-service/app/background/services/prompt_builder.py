import json

RESPONSE_SCHEMA = {
    "vendor_name": "string — BGV vendor / agency name if present, else empty",
    "status": "string — overall status e.g. CLEAR|CONSIDER|IN_PROGRESS|PENDING|FAILED",
    "id_check_status": "string — CLEAR|CONSIDER|PENDING|FAILED|NOT_STARTED|N/A",
    "address_check_status": "string — CLEAR|CONSIDER|PENDING|FAILED|NOT_STARTED|N/A",
    "employment_check_status": "string — CLEAR|CONSIDER|PENDING|FAILED|NOT_STARTED|N/A",
    "education_check_status": "string — CLEAR|CONSIDER|PENDING|FAILED|NOT_STARTED|N/A",
    "criminal_check_status": "string — CLEAR|CONSIDER|PENDING|FAILED|NOT_STARTED|N/A",
    "reference_check_status": "string — CLEAR|CONSIDER|PENDING|FAILED|NOT_STARTED|N/A",
    "report_url": "string URL or null",
    "ai_bgv_summary": "string — concise AI narrative summarizing the BGV report",
    "concern_notes": "string — risks, discrepancies, or follow-ups; empty if none",
    "initiated_date": "YYYY-MM-DD or null",
    "completed_date": "YYYY-MM-DD or null",
    "check_type": "string — one of CRIMINAL|EMPLOYMENT|EDUCATION|REFERENCE|IDENTITY|CREDIT|COMPREHENSIVE",
}


class PromptBuilder:
    def build(self, document_text: str) -> str:
        schema_json = json.dumps(RESPONSE_SCHEMA, indent=2)

        return f"""You are an expert background verification (BGV) report analyst for a recruiting platform.

Analyze ONLY the background verification / screening report text below and return ONLY valid JSON
matching this schema (snake_case keys exactly):

{schema_json}

Rules:
- Extract facts supported by the document. Do NOT invent missing details.
- Use empty strings or null when information is unavailable.
- Prefer status values: CLEAR, CONSIDER, PENDING, IN_PROGRESS, FAILED, NOT_STARTED, N/A.
- If a check type was not performed, use NOT_STARTED or N/A.
- ai_bgv_summary should be a concise third-person narrative for recruiters.
- concern_notes should list discrepancies, adverse findings, or open items; empty if clean.
- initiated_date / completed_date must be YYYY-MM-DD when present; otherwise null.
- report_url only if an explicit URL appears; else null.
- check_type should reflect the package in the document; default COMPREHENSIVE if unclear.
- Never invent vendor names, dates, or findings not in the document.

Background verification document text:
\"\"\"
{document_text}
\"\"\"

Return ONLY valid JSON for THIS background verification document.
"""
