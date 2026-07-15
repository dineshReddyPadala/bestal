import json

RESPONSE_SCHEMA = {
    "confidence": "number between 0 and 1",
    "warnings": ["string"],
    "candidate": {
        "firstName": "string or empty if unknown",
        "lastName": "string or empty if unknown",
        "email": "string or null",
        "phone": "string or null",
        "location": "string or null",
        "linkedinUrl": "string or null",
        "headline": "string or null",
        "summary": "string",
        "yearsExperience": "number or null",
    },
    "primaryRole": "string — best-fit role title",
    "seniority": "string — e.g. Junior|Mid|Senior|Staff|Principal",
    "community": "string — skill community e.g. Data Engineering|Frontend|Backend",
    "skills": [
        {
            "name": "string",
            "proficiencyLevel": "BEGINNER|INTERMEDIATE|ADVANCED|EXPERT",
            "yearsExperience": "number or null",
            "isPrimary": "boolean",
        }
    ],
    "experience": [
        {
            "company": "string",
            "title": "string",
            "startDate": "YYYY-MM or null",
            "endDate": "YYYY-MM or null if current",
            "description": "string",
        }
    ],
    "education": [
        {
            "institution": "string",
            "degree": "string",
            "fieldOfStudy": "string or null",
            "graduationYear": "number or null",
        }
    ],
    "aiSummary": "string — concise AI narrative of the candidate",
    "strengths": "string — key strengths summary",
    "weaknesses": "string — gaps or weak signals",
    "riskFlags": "string — hiring/compliance risks (or empty)",
    "bestalScore": "0-100 integer",
    "recommendedClientRate": "number — suggested client bill rate USD/hr or null",
    "recommendedCandidateRate": "number — suggested candidate pay rate USD/hr or null",
    "rawSections": {
        "summary": "string",
        "skills": "string",
        "experience": "string",
        "education": "string",
    },
}


class PromptBuilder:
    def build(self, resume_text: str) -> str:
        schema_json = json.dumps(RESPONSE_SCHEMA, indent=2)

        return f"""You are an expert resume extraction and scoring engine.

Analyze ONLY the resume text below and return ONLY valid JSON matching this schema (camelCase keys exactly):

{schema_json}

Critical identity rules:
- Candidate name, email, phone, location, LinkedIn, companies, schools, and dates MUST come from the resume text.
- NEVER invent a person name.
- NEVER copy names from documentation, samples, or prior examples.
- NEVER derive personal identity from a filename or job id.
- If the name is not clearly present in the resume text, set firstName and lastName to empty strings and add a warning.
- Prefer exact values written on the resume over guesses.

Other rules:
- Extract facts supported by the resume. Do NOT invent missing details.
- Use null or empty arrays/strings when information is unavailable.
- Split the candidate name into firstName and lastName when possible.
- skills must be unique; do not repeat the same skill name.
- proficiencyLevel must be one of BEGINNER, INTERMEDIATE, ADVANCED, EXPERT.
- Mark only the most important/core skills with isPrimary=true (typically 3-6).
- experience endDate should be null for current roles.
- Dates should use YYYY-MM format when month is known, otherwise best effort.
- primaryRole should be the best-fit role title (often similar to headline).
- seniority should reflect experience level (Junior, Mid, Senior, Staff, Principal, etc.).
- community should be the primary skill community (e.g. Data Engineering, Frontend, Backend, DevOps, Mobile).
- aiSummary is a concise narrative overview of the candidate for recruiters.
- strengths / weaknesses / riskFlags are plain strings (not arrays).
- rawSections should contain concise plain-text excerpts from THIS resume only.
- warnings should list data-quality or uncertainty issues (e.g. missing GitHub, estimated rates).
- confidence is overall extraction confidence from 0.0 to 1.0.
- bestalScore is a single 0-100 integer based on technical skills, project quality, experience, tool knowledge, resume completeness, and client readiness.
- recommendedClientRate and recommendedCandidateRate are USD/hour numbers (or null if unknown). Prefer realistic market estimates and add a warning if rates are estimated.

Resume text:
\"\"\"
{resume_text}
\"\"\"

Return ONLY valid JSON for THIS resume.
"""
