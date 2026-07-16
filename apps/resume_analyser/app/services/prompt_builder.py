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
    "community": "string — the primary skill community, derived from actual skills/experience",
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

=== CRITICAL IDENTITY RULES ===
- Candidate name, email, phone, location, LinkedIn, companies, schools, and dates MUST come from the resume text.
- NEVER invent a person name.
- NEVER copy names from documentation, samples, or prior examples.
- NEVER derive personal identity from a filename or job id.
- If the name is not clearly present in the resume text, set firstName and lastName to empty strings and add a warning.
- Prefer exact values written on the resume over guesses.

=== EXTRACTION RULES ===
- Extract facts supported by the resume. Do NOT invent missing details.
- Use null or empty arrays/strings when information is unavailable.
- Split the candidate name into firstName and lastName when possible.
- skills must be unique; do not repeat the same skill name (merge duplicates, keep the strongest evidence for proficiency/years).
- proficiencyLevel must be one of BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, based on years of use, depth of responsibility, and how central the skill is to the candidate's actual project work — not just whether it's mentioned.
- Mark only the most important/core skills with isPrimary=true (typically 3-6) — the skills the candidate's actual work history centers on, not every skill listed in a skills section.
- experience endDate should be null for current roles.
- Dates should use YYYY-MM format when month is known, otherwise best effort.
- primaryRole should be the best-fit role title (often similar to headline, but corrected against actual work performed if the headline is vague or inflated).
- seniority should reflect actual experience level and scope of responsibility (Junior, Mid, Senior, Staff, Principal, etc.), not just job title wording.

=== COMMUNITY CLASSIFICATION (read carefully — this field is error-prone) ===
community is open-ended (no fixed list), but follow this exact method so it stays accurate and consistent across resumes:

1. FIRST finish identifying `skills` and `experience`. Do not classify community before that.
2. Derive community strictly from the substance of those two fields — NOT from the job title, headline, or company name in isolation.
   Example: someone titled "Software Engineer" whose actual work is ETL pipelines, Spark, Airflow, and SQL warehousing is "Data Engineering", not "Backend Development", regardless of title.
3. Ask yourself explicitly: "What does the majority of this person's hands-on technical work actually involve, based on their skills and experience descriptions — not their resume's self-description?"
4. Use a short, standard, industry-recognizable label (2-4 words) — the kind a recruiter or job board would search for. Prefer common umbrella terms over hyper-specific or invented ones.
   Good: "Data Engineering", "Backend Development", "Frontend Development", "DevOps / Cloud", "Mobile Development", "Data Science / ML", "QA / Test Automation", "Cybersecurity", "UI/UX Design".
   Avoid: overly narrow labels built from a single tool ("Kafka Engineering"), vague labels ("Tech", "IT"), or multi-clause invented labels.
5. Do not default to "Backend Development" or "Full Stack Development" as a safe catch-all guess — only choose them when the evidence actually supports them over a more specific community.
6. If work genuinely spans multiple communities with no clear majority, choose "Full Stack" only if it is literally full-stack web work; otherwise pick the single community representing the largest share of hands-on work, and note the overlap/ambiguity in `warnings`.
7. If the resume gives too little signal to classify confidently, make your best-supported single guess and add a warning noting low confidence — never leave community blank.

=== OUTPUT / SCORING RULES ===
- aiSummary is a concise narrative overview of the candidate for recruiters.
- strengths / weaknesses / riskFlags are plain strings (not arrays).
- rawSections should contain concise plain-text excerpts from THIS resume only.
- warnings should list data-quality or uncertainty issues (e.g. missing GitHub, estimated rates, ambiguous community fit).
- confidence is overall extraction confidence from 0.0 to 1.0.
- bestalScore is a single 0-100 integer based on technical skills, project quality, experience, tool knowledge, resume completeness, and client readiness.
- recommendedClientRate and recommendedCandidateRate are USD/hour numbers (or null if unknown). Prefer realistic market estimates and add a warning if rates are estimated.

Resume text:
\"\"\"
{resume_text}
\"\"\"

Return ONLY valid JSON for THIS resume. No markdown fences, no commentary before or after the JSON.
"""