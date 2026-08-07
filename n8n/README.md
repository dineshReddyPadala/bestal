# BesTal n8n workflows

Importable n8n workflows for BesTal AI orchestration.

Fastify remains the system of record. n8n only orchestrates AI steps and callbacks.

## Workflows

| Workflow | Version | Path | Docs |
|----------|---------|------|------|
| `BESTAL_RESUME_AI_SCREENING` | `1.0.0` | `/webhook/resume-screening` | [workflows/BESTAL_RESUME_AI_SCREENING.md](./workflows/BESTAL_RESUME_AI_SCREENING.md) |
| `BESTAL_EVALUATION_AI_ANALYSIS` | `1.0.0` | `/webhook/evaluation-analysis` | [workflows/BESTAL_EVALUATION_AI_ANALYSIS.md](./workflows/BESTAL_EVALUATION_AI_ANALYSIS.md) |
| `BESTAL_BGV_AI_ANALYSIS` | `1.0.0` | `/webhook/bgv-analysis` | [workflows/BESTAL_BGV_AI_ANALYSIS.md](./workflows/BESTAL_BGV_AI_ANALYSIS.md) |

## Local development (Docker)

From this folder:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Open **http://localhost:5678**, import the workflow JSON, attach OpenAI credentials, activate.

`BESTAL_RESUME_AI_SCREENING.json` uses `$env.BESTAL_API_BASE_URL`, `$env.N8N_WEBHOOK_SECRET`, and `$env.AUTOMATION_CALLBACK_SECRET` — set in [docker-compose.dev.yml](./docker-compose.dev.yml) (must match Platform Settings + `apps/api/.env` `AUTOMATION_CALLBACK_SECRET`).

Set **Platform Settings → Automation** base URL to `http://localhost:5678` and webhook path to match the workflow Webhook node (e.g. `/webhook/resume-screening`).

## Import (cloud or local)

1. n8n → **Workflows** → **Import from File**
2. Choose the JSON under `workflows/`
3. Attach OpenAI credentials
4. Configure workflow URLs in **Super Admin → Platform Settings → Automation** (not API `.env`)
5. Activate

## Notes

- Business IDs (`jobId`, `candidateId`, `documentId`, `requestedBy`) are **numeric integers**.
- Do not use UUIDs for BesTal entity IDs.
- No Oorwin / ATS integration in these workflows.
