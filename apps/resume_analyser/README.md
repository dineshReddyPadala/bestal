# Resume Analysis AI API

Part of the BesTal monorepo (`bestal/resume_analyser`).

REST API that analyzes a base64-encoded resume and returns structured AI extraction + scoring using OpenAI via LangGraph.

## Flow

```
BesTal Web (Analyze resume dialog)
        │
        ▼
POST /api/v1/ai/resume/analyze
        │
        ▼
ResumeAnalysisService
        │
        ├── Decode base64 content
        ├── ResumeParser        → Extract text from PDF/DOCX
        ├── PromptBuilder       → Build extraction + scoring prompt
        ├── ResumeAnalysisAgent → LangGraph: invoke LLM → validate JSON → retry once
        └── ResponseFormatter   → Parse and validate structured response
        │
        ▼
JSON Response (camelCase)
```

## Setup

```bash
# From repo root (recommended)
cp resume_analyser/.env.example resume_analyser/.env
# set OPENAI_API_KEY
docker compose up -d --build resume-analyser
```

Or locally:

```bash
cd resume_analyser
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Set `OPENAI_API_KEY` in `.env`.

## Run

Docker (port **8001** on host):

```bash
docker compose up -d resume-analyser
```

Local:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

API docs: http://127.0.0.1:8001/docs

## Endpoint

`POST /api/v1/ai/resume/analyze`  
`Content-Type: application/json`

### Request

```json
{
  "fileName": "alexandra-petrov-resume.pdf",
  "mimeType": "application/pdf",
  "content": "<base64-encoded-file-content>",
  "jobId": "ext-demo-001"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| fileName | Yes | Original resume filename (`.pdf` or `.docx`) |
| mimeType | Yes | `application/pdf` or DOCX MIME type |
| content | Yes | Base64-encoded file bytes |
| jobId | No | Optional correlation id; generated if omitted |

### Response highlights

```json
{
  "jobId": "ext-20260713-001",
  "confidence": 0.91,
  "extractedAt": "2026-07-13T10:30:00.000Z",
  "warnings": ["GitHub URL not found on resume"],
  "candidate": { "firstName": "Alexandra", "lastName": "Petrov", "yearsExperience": 8 },
  "primaryRole": "Senior Data Engineer",
  "seniority": "Senior",
  "community": "Data Engineering",
  "skills": [{ "name": "Snowflake", "proficiencyLevel": "ADVANCED", "isPrimary": true }],
  "experience": [],
  "education": [],
  "aiSummary": "Senior Data Engineer with strong Snowflake, dbt, Airflow and AWS experience.",
  "strengths": "Strong cloud data warehouse experience.",
  "weaknesses": "Limited leadership evidence.",
  "riskFlags": "No GitHub link found.",
  "bestalScore": 84,
  "recommendedClientRate": 38,
  "recommendedCandidateRate": 25,
  "rawSections": { "summary": "", "skills": "", "experience": "", "education": "" }
}
```

`bestalScore` is a **number** (0–100), not an object.

## Error Codes

| Scenario | HTTP |
|----------|------|
| Invalid / missing payload or base64 | 400 |
| Unsupported file type | 415 |
| Text extraction fails | 422 |
| OpenAI request fails | 502 |
| Invalid AI JSON after retry | 500 |

## Web integration

BesTal web uses `VITE_AI_EXTRACTION_URL` (default `http://localhost:8001/api/v1/ai/resume/analyze`) from the **Analyze resume** dialog on admin and recruiter Candidates pages.
