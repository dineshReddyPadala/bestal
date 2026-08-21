/**
 * Patch BESTAL_EVALUATION_AI_ANALYSIS.json to pass previousBestalScore through
 * the workflow and return recalculated bestalScore in the callback result.
 *
 * Usage: node n8n/scripts/patch-evaluation-bestal-score.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workflowPath = path.join(
  __dirname,
  '..',
  'workflows',
  'BESTAL_EVALUATION_AI_ANALYSIS.json',
);

const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

function setNodeCode(name, jsCode) {
  const node = workflow.nodes.find((n) => n.name === name);
  if (!node) throw new Error(`Node not found: ${name}`);
  node.parameters.jsCode = jsCode;
}

setNodeCode(
  'Validate Request',
  `const DEFAULT_WORKFLOW_NAME = 'BESTAL_EVALUATION_AI_ANALYSIS';
const DEFAULT_WORKFLOW_VERSION = '1.0.0';

const req = $input.first();
const headers = req.json.headers || {};
const body = req.json.body ?? req.json;

const workflowName = String(body?.workflowName || DEFAULT_WORKFLOW_NAME).trim();
const workflowVersion = String(body?.workflowVersion || DEFAULT_WORKFLOW_VERSION).trim();

const secretHeader = headers['x-n8n-webhook-secret'] || headers['X-N8N-Webhook-Secret'];
const auth = headers.authorization || headers.Authorization || '';
const bearer = typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')
  ? auth.slice(7).trim()
  : '';
const expected = $env.N8N_WEBHOOK_SECRET;

if (expected) {
  const ok = (secretHeader && secretHeader === expected) || (bearer && bearer === expected);
  if (!ok) {
    return [{
      json: {
        ok: false,
        stage: 'Validate Request',
        errorCode: 'UNAUTHORIZED',
        errorMessage: 'Invalid or missing webhook secret',
        jobId: Number(body?.jobId) || null,
        candidateId: Number(body?.candidateId) || null,
        workflowName: workflowName,
        workflowVersion: workflowVersion,
      }
    }];
  }
}

function asPositiveInt(value, field) {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(\`\${field} must be a positive integer\`);
  }
  if (typeof value === 'string' && /[a-f0-9-]{36}/i.test(value)) {
    throw new Error(\`\${field} must not be a UUID\`);
  }
  return n;
}

function parsePreviousBestalScore(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

try {
  const jobId = asPositiveInt(body.jobId, 'jobId');
  const candidateId = asPositiveInt(body.candidateId, 'candidateId');
  const documentId = asPositiveInt(body.documentId, 'documentId');
  const requestedBy = asPositiveInt(body.requestedBy, 'requestedBy');
  const documentUrl = String(body.documentUrl || '').trim();
  if (!/^https?:\\/\\//i.test(documentUrl)) {
    throw new Error('documentUrl must be an http(s) URL');
  }
  const previousBestalScore = parsePreviousBestalScore(
    body.previousBestalScore ?? body.previous_bestal_score ?? body.bestalScore ?? body.bestal_score,
  );

  return [{
    json: {
      ok: true,
      jobId,
      candidateId,
      documentId,
      requestedBy,
      documentUrl,
      previousBestalScore,
      workflowName: workflowName,
      workflowVersion: workflowVersion,
    }
  }];
} catch (error) {
  return [{
    json: {
      ok: false,
      stage: 'Validate Request',
      errorCode: 'INVALID_INPUT',
      errorMessage: error.message || 'Invalid input',
      jobId: Number(body?.jobId) || null,
      candidateId: Number(body?.candidateId) || null,
      workflowName: workflowName,
      workflowVersion: workflowVersion,
    }
  }];
}`,
);

// Add previousBestalScore to Extract Input set node
const extractInput = workflow.nodes.find((n) => n.name === 'Extract Input');
if (extractInput?.parameters?.assignments?.assignments) {
  const hasField = extractInput.parameters.assignments.assignments.some(
    (a) => a.name === 'previousBestalScore',
  );
  if (!hasField) {
    extractInput.parameters.assignments.assignments.push({
      id: 'previousBestalScore',
      name: 'previousBestalScore',
      value: '={{ $json.previousBestalScore }}',
      type: 'number',
    });
  }
}

setNodeCode(
  'Prepare AI Prompt',
  `const ctx = $('Extract Input').first().json;
const item = $input.first();
const text = String(item.json.text || item.json.data || item.json.content || '').trim();

if (!text || text.length < 40) {
  return [{
    json: {
      ok: false,
      stage: 'Extract Evaluation Text',
      errorCode: 'EVALUATION_EXTRACTION_FAILED',
      errorMessage: 'Unable to extract evaluation text',
      jobId: ctx.jobId,
      candidateId: ctx.candidateId,
      workflowName: ctx.workflowName,
      workflowVersion: ctx.workflowVersion,
    }
  }];
}

const docText = text.slice(0, 100000);
const truncated = text.length > 100000;
const previousBestalScore = ctx.previousBestalScore != null ? Number(ctx.previousBestalScore) : null;

const schema = {
  confidence: 'number 0-1',
  warnings: ['string'],
  evaluatorName: 'string',
  evaluatorCompany: 'string',
  evaluationType: 'Coding Test|Live Technical Interview|System Design|Platform-Specific|Communication|Functional|Manual Scorecard',
  evaluationDate: 'YYYY-MM-DD|null',
  technicalScore: '0-100 int',
  communicationScore: '0-100 int',
  problemSolvingScore: '0-100 int',
  collaborationCulturalFitScore: '0-100 int',
  clientReadinessScore: '0-100 int',
  recommendation: 'Strong Hire|Hire|Borderline|Reject',
  evaluatorComments: 'string',
  aiEvaluationSummary: 'string',
  evaluationSummary: 'string optional',
  extractedText: 'string optional excerpt',
  bestalScore: '0-100 int — updated BesTal score after blending resume + evaluation',
};

const prompt = \`You are an expert technical interview evaluation engine for BesTal.
Return ONLY valid JSON (camelCase) matching this schema:
\${JSON.stringify(schema, null, 2)}

Rules:
- Extract facts supported by the document only.
- All score fields are integers 0-100.
- Convert other scales proportionally to 0-100.
- recommendation must be Strong Hire, Hire, Borderline, or Reject.
- aiEvaluationSummary is a concise recruiter narrative.
- evaluatorComments preserves key evaluator notes.
- previousBestalScore (from resume screening) is \${previousBestalScore == null ? 'not available' : previousBestalScore}.
- Recalculate bestalScore (required integer 0-100):
  * When previousBestalScore is available: blend ~40% previousBestalScore with ~60% average of the five dimension scores, then apply recommendation adjustment (Strong Hire +3, Hire +0, Borderline -5, Reject -12, clamp 0-100).
  * When previousBestalScore is null: derive bestalScore from evaluation dimension average and recommendation only.
\${truncated ? '- Document text was truncated; note in warnings.\\n' : ''}
Evaluation document text:
\"\"\"
\${docText}
\"\"\"

Return ONLY JSON.\`;

return [{
  json: {
    ok: true,
    jobId: ctx.jobId,
    candidateId: ctx.candidateId,
    documentId: ctx.documentId,
    requestedBy: ctx.requestedBy,
    previousBestalScore,
    workflowName: ctx.workflowName,
    workflowVersion: ctx.workflowVersion,
    prompt,
  }
}];`,
);

setNodeCode(
  'Normalize Result',
  `const item = $input.first().json;
const ai = item.ai || {};

function score(key, snake) {
  const raw = ai[key] ?? ai[snake];
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(100, Math.round(n)));
}

const result = {
  confidence: typeof ai.confidence === 'number' ? ai.confidence : 0.85,
  evaluatorName: ai.evaluatorName || ai.evaluator_name || undefined,
  evaluatorCompany: ai.evaluatorCompany || ai.evaluator_company || undefined,
  evaluationType: ai.evaluationType || ai.evaluation_type || undefined,
  evaluationDate: ai.evaluationDate || ai.evaluation_date || undefined,
  technicalScore: score('technicalScore', 'technical_score'),
  communicationScore: score('communicationScore', 'communication_score'),
  problemSolvingScore: score('problemSolvingScore', 'problem_solving_score'),
  collaborationCulturalFitScore: score('collaborationCulturalFitScore', 'collaboration_cultural_fit_score'),
  clientReadinessScore: score('clientReadinessScore', 'client_readiness_score'),
  recommendation: ai.recommendation || undefined,
  evaluatorComments: ai.evaluatorComments || ai.evaluator_comments || undefined,
  aiEvaluationSummary: ai.aiEvaluationSummary || ai.ai_evaluation_summary || undefined,
  evaluationSummary: ai.evaluationSummary || ai.evaluation_summary || undefined,
  extractedText: ai.extractedText || ai.extracted_text || undefined,
  bestalScore: score('bestalScore', 'bestal_score'),
  warnings: Array.isArray(ai.warnings) ? ai.warnings : [],
};

return [{
  json: {
    jobId: item.jobId,
    candidateId: item.candidateId,
    workflowName: item.workflowName,
    workflowVersion: item.workflowVersion,
    result,
  }
}];`,
);

fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2) + '\n');
console.log('Patched', workflowPath);
