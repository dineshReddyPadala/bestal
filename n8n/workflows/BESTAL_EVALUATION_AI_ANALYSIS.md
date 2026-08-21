# BESTAL_EVALUATION_AI_ANALYSIS

n8n orchestration for BesTal Evaluation AI Analysis.

| Field | Value |
|-------|--------|
| **Workflow name** | `BESTAL_EVALUATION_AI_ANALYSIS` |
| **Workflow version** | `1.0.0` |
| **Job type** | `EVALUATION_ANALYSIS` |
| **Trigger path** | `/webhook/evaluation-analysis` (`N8N_EVALUATION_WORKFLOW_PATH`) |
| **Import file** | [`BESTAL_EVALUATION_AI_ANALYSIS.json`](./BESTAL_EVALUATION_AI_ANALYSIS.json) |

## Sequence

```text
Webhook → Validate Request → Input Valid? → Respond Trigger Accepted (immediate HTTP 200)
→ Extract Input → Download Evaluation From Signed URL
→ Extract Evaluation Text → Prepare AI Prompt → OpenAI → Validate Structured JSON
→ Normalize Result → Prepare Callback Payload → Call Fastify Internal Callback
→ Handle Success (no-op) / Handle Failure
```

## Trigger HTTP response (immediate)

After validation, **Respond Trigger Accepted** returns `{ ok: true, accepted: true, jobId, status: "PROCESSING" }` within ~1–2s. Full analysis completion is only via the internal callback; Fastify polls `GET /automation/jobs/:id`.

---

## Input (Fastify → n8n)

```json
{
  "jobId": 125,
  "candidateId": 1001,
  "documentId": 502,
  "documentUrl": "https://…signed-url…",
  "requestedBy": 25
}
```

All IDs are positive integers (never UUIDs).

## Success callback (n8n → Fastify)

`POST {BESTAL_API_BASE_URL}/internal/automation/callbacks/evaluation-analysis`

Auth: `Authorization: Bearer <AUTOMATION_CALLBACK_SECRET>`

```json
{
  "jobId": 125,
  "candidateId": 1001,
  "status": "COMPLETED",
  "result": {
    "technicalScore": 82,
    "communicationScore": 78,
    "problemSolvingScore": 80,
    "collaborationCulturalFitScore": 75,
    "clientReadinessScore": 70,
    "recommendation": "Hire",
    "evaluatorComments": "…",
    "aiEvaluationSummary": "…"
  }
}
```

## Failure callback

```json
{
  "jobId": 125,
  "candidateId": 1001,
  "status": "FAILED",
  "errorCode": "EVALUATION_EXTRACTION_FAILED",
  "errorMessage": "Unable to extract evaluation text",
  "result": {}
}
```

## AI result fields

Aligned with [`evaluationAnalysisOutputSchema`](../../apps/api/src/modules/automation/dto/evaluation-analysis.dto.ts):

- `technicalScore`, `communicationScore`, `problemSolvingScore`, `collaborationCulturalFitScore`, `clientReadinessScore`
- `recommendation`, `evaluatorComments`, `aiEvaluationSummary`
- Optional: `evaluatorName`, `evaluatorCompany`, `evaluationType`, `evaluationDate`, `evaluationSummary`

Fastify requires `aiEvaluationSummary` **or** at least one score.

## Environment

Configure workflow URLs in **Super Admin → Platform Settings → Automation**. Keep `AUTOMATION_CALLBACK_SECRET` in Fastify env.

### n8n

```env
BESTAL_API_BASE_URL=http://host.docker.internal:3001
AUTOMATION_CALLBACK_SECRET=…
N8N_WEBHOOK_SECRET=…
```

Plus OpenAI credentials in n8n credential store.

See [BESTAL_RESUME_AI_SCREENING.md](./BESTAL_RESUME_AI_SCREENING.md) for shared retry, idempotency, and security rules.
