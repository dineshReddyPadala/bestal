# BesTal AI Service

Single FastAPI process for resume analysis, evaluation scoring, and background verification.

| Endpoint | Purpose |
|----------|---------|
| `POST /api/v1/ai/resume/analyze` | Resume extraction |
| `POST /api/v1/ai/evaluation/analyze` | Evaluation document analysis |
| `POST /api/v1/ai/background/analyze` | Background verification analysis |
| `GET /health` | Health check |
| `GET /docs` | OpenAPI docs |

## Local

```bash
cd apps/ai-service
cp .env.example .env   # set OPENAI_API_KEY
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Docker

From the monorepo root:

```bash
docker compose up ai-service
```

Host port **8001** → container **8000**.

## Node API env

Point all three URLs at this one service:

```env
AI_EXTRACTION_URL=http://localhost:8001/api/v1/ai/resume/analyze
AI_EVALUATION_URL=http://localhost:8001/api/v1/ai/evaluation/analyze
AI_BGV_URL=http://localhost:8001/api/v1/ai/background/analyze
```

The older `apps/resume_analyser`, `apps/evaluater`, and `apps/bg_verifier` folders are deprecated in favor of this service.
