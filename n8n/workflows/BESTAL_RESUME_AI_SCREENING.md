# BESTAL_RESUME_AI_SCREENING

n8n orchestration workflow for BesTal Resume AI Screening.

| Field | Value |
|-------|--------|
| **Workflow name** | `BESTAL_RESUME_AI_SCREENING` |
| **Workflow version** | `1.0.0` |
| **Job type** | `RESUME_SCREENING` |
| **Trigger path** | `/webhook/resume-screening` (matches `N8N_RESUME_WORKFLOW_PATH`) |
| **Import file** | [`BESTAL_RESUME_AI_SCREENING.json`](./BESTAL_RESUME_AI_SCREENING.json) |

This workflow does **not** integrate with Oorwin or any ATS. It only:

1. Accepts a Fastify trigger payload (numeric IDs + signed resume URL)
2. Extracts resume text
3. Calls OpenAI for structured screening JSON
4. Validates / normalizes output
5. Calls the Fastify internal callback

BesTal business rules, RBAC, and DB writes remain in Fastify.

---

## Sequence

```text
Webhook
→ Validate Request
→ Input Valid?
→ Respond Trigger Accepted (immediate HTTP 200 to Fastify)
→ Extract Input
→ Download Resume From Signed URL
→ Extract Resume Text
→ Prepare AI Prompt
→ OpenAI
→ Validate Structured JSON
→ Normalize Skills
→ Prepare Callback Payload
→ Call Fastify Internal Callback
→ Handle Success (no-op — webhook already answered)
→ Handle Failure
```

---

## Trigger HTTP response (immediate)

After validation passes, **Respond Trigger Accepted** returns to Fastify within ~1–2s. Fastify does **not** wait for OpenAI or the internal callback.

```json
{
  "ok": true,
  "accepted": true,
  "jobId": 124,
  "candidateId": 1001,
  "status": "PROCESSING",
  "workflowName": "BESTAL_RESUME_AI_SCREENING",
  "workflowVersion": "1.0.0"
}
```

`candidateId` is omitted when the job was started without an existing candidate row.

Full screening completion is reported only via the internal callback (`status: "COMPLETED"` or `"FAILED"`). The UI polls `GET /automation/jobs/:id` — never the n8n trigger response.

Validation/auth failures still respond synchronously on the failure branch via **Handle Failure**.

---

## Input contract (Fastify → n8n)

```json
{
  "jobId": 124,
  "candidateId": 1001,
  "documentId": 501,
  "documentUrl": "https://…signed-url…",
  "requestedBy": 25
}
```

| Field | Type | Rules |
|-------|------|--------|
| `jobId` | number (integer) | Required, `> 0` |
| `candidateId` | number (integer) | Required, `> 0` |
| `documentId` | number (integer) | Required, `> 0` |
| `documentUrl` | string (URL) | Required, non-empty signed download URL |
| `requestedBy` | number (integer) | Required, `> 0` |

**Numeric ID handling**

- Treat all IDs as JSON numbers (not strings, not UUIDs).
- Coerce string digits only if necessary, then re-validate `Number.isInteger(n) && n > 0`.
- Reject payloads that contain UUID-shaped `jobId` / `candidateId` / `documentId` / `requestedBy`.
- Echo the same numeric `jobId` and `candidateId` in every success and failure callback.

**Inbound auth (Fastify → n8n)**

Configure the Webhook node (or an early IF/Code node) to require:

- Header `X-N8N-Webhook-Secret: <N8N_WEBHOOK_SECRET>`, and/or
- `Authorization: Bearer <N8N_WEBHOOK_SECRET>`

Never log the secret value.

---

## Output / callback contract (n8n → Fastify)

**Endpoint:** `POST {BESTAL_API_BASE_URL}/internal/automation/callbacks/resume-screening`

**Auth:** `Authorization: Bearer <AUTOMATION_CALLBACK_SECRET>`

### Success

```json
{
  "jobId": 124,
  "candidateId": 1001,
  "status": "COMPLETED",
  "result": {
    "confidence": 0.91,
    "firstName": "Alexandra",
    "lastName": "Petrov",
    "email": "alexandra.petrov@example.com",
    "phone": "+1 415 555 0142",
    "location": "San Francisco, CA",
    "timezone": "America/Los_Angeles",
    "headline": "Senior Data Engineer",
    "yearsExperience": 8,
    "primaryRole": "Senior Data Engineer",
    "summary": "…",
    "aiSummary": "…",
    "strengths": "…",
    "weaknesses": "…",
    "riskFlags": "",
    "community": "Data Engineering",
    "skillCategory": "Data Engineering",
    "bestalScore": 84,
    "skills": [
      {
        "name": "Snowflake",
        "skillCategory": "Data Engineering",
        "proficiency": "ADVANCED",
        "skillYearsExperience": 4,
        "isPrimary": true
      }
    ],
    "warnings": []
  },
  "n8nExecutionId": null
}
```

`n8nExecutionId` is optional. Fastify ignores exposing it to end users.

### Failure

```json
{
  "jobId": 124,
  "candidateId": 1001,
  "status": "FAILED",
  "errorCode": "RESUME_EXTRACTION_FAILED",
  "errorMessage": "Unable to extract resume text",
  "result": {}
}
```

### Error codes

| Code | When |
|------|------|
| `INVALID_INPUT` | Missing/invalid numeric IDs or `documentUrl` |
| `UNAUTHORIZED` | Missing/invalid inbound webhook secret |
| `RESUME_DOWNLOAD_FAILED` | Signed URL download failed |
| `RESUME_EXTRACTION_FAILED` | Could not extract text from PDF/DOCX |
| `OPENAI_FAILED` | OpenAI exhausted retries / hard failure |
| `AI_OUTPUT_INVALID` | Model returned non-JSON or schema-invalid JSON |
| `CALLBACK_FAILED` | Fastify success callback HTTP error (logged; workflow ends in error) |
| `INTERNAL_ERROR` | Unexpected workflow error |

---

## AI result schema (inside `result`)

Aligned with Fastify [`resumeScreeningOutputSchema`](../../apps/api/src/modules/automation/dto/resume-screening.dto.ts).

Required for Fastify acceptance: at least a name (`firstName`/`lastName`) **or** non-empty `aiSummary`.

Skills items:

| Field | Notes |
|-------|--------|
| `name` / `skillName` | One short skill label |
| `skillCategory` | Community/category string |
| `proficiency` / `proficiencyLevel` | `BEGINNER` \| `INTERMEDIATE` \| `ADVANCED` \| `EXPERT` |
| `skillYearsExperience` / `yearsExperience` | Number |
| `isPrimary` | Boolean |

Normalization rules (Normalize Skills node):

- Trim / collapse whitespace
- Deduplicate by lowercased skill name
- Cap skill name length at 150
- Ensure at most one `isPrimary: true` (first wins)
- Map unknown proficiency → `INTERMEDIATE`
- Do **not** invent skill communities beyond model output (Fastify maps to master data)

---

## Node-by-node configuration

### 1. Webhook

| Setting | Value |
|---------|--------|
| Node | Webhook |
| HTTP Method | `POST` |
| Path | `resume-screening` |
| Response mode | `Last Node` (or respond after callback) |
| Auth | Header Auth / custom header check for `N8N_WEBHOOK_SECRET` |

### 2. Validate Request

| Setting | Value |
|---------|--------|
| Node | Code |
| Purpose | Reject bad auth + invalid IDs early |

Validation logic:

1. Read body from webhook JSON.
2. Ensure `jobId`, `candidateId`, `documentId`, `requestedBy` are finite integers `> 0`.
3. Ensure `documentUrl` is a non-empty string starting with `http`.
4. On failure → branch to **Handle Failure** with `INVALID_INPUT` (still include numeric IDs when parseable).

### 3. Extract Input

| Setting | Value |
|---------|--------|
| Node | Set / Code |
| Purpose | Normalize working fields onto `$json` |

Outputs:

```json
{
  "jobId": 124,
  "candidateId": 1001,
  "documentId": 501,
  "documentUrl": "…",
  "requestedBy": 25,
  "workflowName": "BESTAL_RESUME_AI_SCREENING",
  "workflowVersion": "1.0.0"
}
```

### 4. Download Resume From Signed URL

| Setting | Value |
|---------|--------|
| Node | HTTP Request |
| Method | `GET` |
| URL | `={{ $json.documentUrl }}` |
| Response format | File |
| Timeout | 60s |
| On error | Continue → Handle Failure (`RESUME_DOWNLOAD_FAILED`) |

Do not log the full signed URL query string (may contain temporary credentials).

### 5. Extract Resume Text

| Setting | Value |
|---------|--------|
| Node | Extract From File (PDF/DOCX) or Code binary→text |
| On empty text | Handle Failure (`RESUME_EXTRACTION_FAILED`) |
| Max text length | ~100k chars (truncate with warning if needed) |

### 6. Prepare AI Prompt

| Setting | Value |
|---------|--------|
| Node | Code |
| Purpose | Build system + user prompt; inject resume text |

Prompt requirements (summary):

- Return **only** valid camelCase JSON
- Never invent identity fields not present in the resume
- Skills: one short label each; include category, proficiency, years, primary flag
- Include summary, aiSummary, strengths, weaknesses, primaryRole, yearsExperience, headline

### 7. OpenAI

| Setting | Value |
|---------|--------|
| Node | OpenAI / LangChain OpenAI |
| Model | From credential / env (e.g. `gpt-4o-mini`) |
| Response format | JSON object when available |
| Temperature | `0.1` |
| Max retries | `3` (transient 429/5xx only) |
| Retry wait | Exponential backoff (e.g. 2s, 4s, 8s) |
| Credentials | n8n OpenAI credential store — **never** hard-code keys |

On exhaustion → Handle Failure (`OPENAI_FAILED`).

### 8. Validate Structured JSON

| Setting | Value |
|---------|--------|
| Node | Code |
| Purpose | `JSON.parse`, schema checks, reject empty name+aiSummary |

On invalid JSON / schema → Handle Failure (`AI_OUTPUT_INVALID`).

Do **not** call Fastify success callback before this node passes.

### 9. Normalize Skills

| Setting | Value |
|---------|--------|
| Node | Code |
| Purpose | Dedupe skills, normalize proficiency, single primary |

### 10. Prepare Callback Payload

| Setting | Value |
|---------|--------|
| Node | Code |
| Purpose | Build Fastify success body |

```json
{
  "jobId": 124,
  "candidateId": 1001,
  "status": "COMPLETED",
  "result": { }
}
```

Include `workflowName` / `workflowVersion` only inside logs or optional metadata — Fastify success body uses the contract above.

### 11. Call Fastify Internal Callback

| Setting | Value |
|---------|--------|
| Node | HTTP Request |
| Method | `POST` |
| URL | `={{ $env.BESTAL_API_BASE_URL }}/internal/automation/callbacks/resume-screening` |
| Headers | `Authorization: Bearer {{ $env.AUTOMATION_CALLBACK_SECRET }}`, `Content-Type: application/json` |
| Body | Prepared success payload |
| Timeout | 30s |

Never log `AUTOMATION_CALLBACK_SECRET`.

Idempotency: Fastify ignores duplicate `COMPLETED` callbacks for the same numeric `jobId`. Safe to retry this HTTP call on transient network errors (max 2 retries).

### 12. Handle Success

| Setting | Value |
|---------|--------|
| Node | Respond to Webhook / NoOp |
| Body | `{ "ok": true, "jobId": 124, "status": "COMPLETED" }` |

### 13. Handle Failure

| Setting | Value |
|---------|--------|
| Node | Code → HTTP Request |
| Purpose | Always POST failure callback when `jobId` & `candidateId` are known |

Failure body:

```json
{
  "jobId": 124,
  "candidateId": 1001,
  "status": "FAILED",
  "errorCode": "RESUME_EXTRACTION_FAILED",
  "errorMessage": "Unable to extract resume text",
  "result": {}
}
```

Then respond to webhook with `{ "ok": false, "jobId", "errorCode" }`.

---

## Retry behavior

| Stage | Retries | Notes |
|-------|---------|--------|
| OpenAI | 3 | Transient HTTP 429/5xx / network only |
| Fastify success callback | 2 | Transient network / 502/503 |
| Fastify failure callback | 2 | Best-effort; log if both fail |
| Download / extract / validate | 0 | Fail fast → failure callback |

Do not retry validation errors (`INVALID_INPUT`, `AI_OUTPUT_INVALID`).

---

## Idempotency

- Fastify owns idempotency by numeric `AutomationJob.id` (`jobId`).
- Workflow should not create candidates or skills.
- Re-delivery of the same trigger for an already-completed job: Fastify callback returns `alreadyProcessed: true`; treat as success.
- Prefer including the same `jobId` on every outbound callback so Fastify can short-circuit safely.

---

## Required credentials (n8n credential store)

| Credential | Used by |
|------------|---------|
| OpenAI API | OpenAI node |
| (Optional) Header Auth | Webhook inbound secret |

Never place OpenAI keys or callback secrets in node hard-coded parameters or workflow static data that is logged.

---

## Required environment variables

### On Fastify (`apps/api`)

| Setting | Purpose |
|----------|---------|
| **Super Admin → Platform Settings → Automation** | `baseUrl`, webhook paths, workflow name/version per type, `webhookSecret`, trigger timeout |
| `AUTOMATION_CALLBACK_SECRET` (env) | Inbound callback Bearer secret |

### On n8n

| Variable | Purpose |
|----------|---------|
| `BESTAL_API_BASE_URL` | e.g. `http://host.docker.internal:3001` or public API URL |
| `AUTOMATION_CALLBACK_SECRET` | Same value as Fastify |
| `N8N_WEBHOOK_SECRET` | Same value Fastify sends on trigger |
| OpenAI credential | Model access |

---

## Security rules

1. Never expose OpenAI credentials in webhook responses or logs.
2. Never log `AUTOMATION_CALLBACK_SECRET` or `N8N_WEBHOOK_SECRET`.
3. Avoid logging full signed `documentUrl` query strings.
4. Do not return raw resume text to the webhook caller.
5. Frontend never calls this workflow — only Fastify does.

---

## Import instructions

1. Open n8n → **Workflows** → **Import from File**.
2. Select `BESTAL_RESUME_AI_SCREENING.json`.
3. Attach OpenAI credentials.
4. Set n8n env vars listed above.
5. Configure **Super Admin → Platform Settings → Automation** in BesTal (base URL, paths, webhook secret).
6. Activate the workflow.
7. Smoke-test by uploading a resume with automation enabled; confirm `GET /api/v1/automation/jobs/:id` reaches `COMPLETED`.
