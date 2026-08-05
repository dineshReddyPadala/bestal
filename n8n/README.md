# BesTal n8n workflows

Importable n8n workflows for BesTal AI orchestration.

Fastify remains the system of record. n8n only orchestrates AI steps and callbacks.

## Workflows

| Workflow | Version | Path | Docs |
|----------|---------|------|------|
| `BESTAL_RESUME_AI_SCREENING` | `1.0.0` | `/webhook/resume-screening` | [workflows/BESTAL_RESUME_AI_SCREENING.md](./workflows/BESTAL_RESUME_AI_SCREENING.md) |
| `BESTAL_EVALUATION_AI_ANALYSIS` | `1.0.0` | `/webhook/evaluation-analysis` | [workflows/BESTAL_EVALUATION_AI_ANALYSIS.md](./workflows/BESTAL_EVALUATION_AI_ANALYSIS.md) |
| `BESTAL_BGV_AI_ANALYSIS` | `1.0.0` | `/webhook/bgv-analysis` | [workflows/BESTAL_BGV_AI_ANALYSIS.md](./workflows/BESTAL_BGV_AI_ANALYSIS.md) |

## Import

1. n8n → **Workflows** → **Import from File**
2. Choose the JSON under `workflows/`
3. Attach OpenAI credentials
4. Configure workflow URLs in **Super Admin → Platform Settings → Automation** (not API `.env`)
5. Activate

## Notes

- Business IDs (`jobId`, `candidateId`, `documentId`, `requestedBy`) are **numeric integers**.
- Do not use UUIDs for BesTal entity IDs.
- No Oorwin / ATS integration in these workflows.
