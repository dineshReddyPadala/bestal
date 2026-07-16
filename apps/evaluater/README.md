# Evaluation AI API (BesTal monorepo: apps/evaluater)

REST API that analyzes a base64-encoded evaluation PDF/DOCX and returns structured scores + summary using OpenAI via LangGraph.

## Flow (same pattern as resume_analyser)

```
BesTal Web (Evaluations tab / Add evaluation dialog)
        │
        ▼
POST /api/v1/evaluations/extract-evaluation   (Node API, multipart)
        │
        ▼
EvaluationExtractionClient
        │
        ├── No AI_EVALUATION_URL → static demo JSON
        └── AI_EVALUATION_URL set →
              POST /api/v1/ai/evaluation/analyze  (this service)
                └── DocumentParser → PromptBuilder → EvaluationAgent → ResponseFormatter
        │
        ▼
JSON Response (camelCase) → web form prefill
```

## Setup

```bash
cd apps/evaluater
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set OPENAI_API_KEY
```

## Run

Local (port **8002**):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

Docker (host **8002** → container **8000**):

```bash
docker build -t evaluater ./apps/evaluater
docker run --rm -p 8002:8000 --env-file ./apps/evaluater/.env evaluater
```

API docs: http://127.0.0.1:8002/docs  
Health: http://127.0.0.1:8002/health

## Node API env

In `apps/api/.env`:

```env
AI_EVALUATION_URL=http://localhost:8002/api/v1/ai/evaluation/analyze
```

## Endpoint

`POST /api/v1/ai/evaluation/analyze`

```json
{
  "fileName": "candidate-eval.pdf",
  "mimeType": "application/pdf",
  "content": "<base64>",
  "candidateId": "123"
}
```
