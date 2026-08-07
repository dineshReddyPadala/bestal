/**
 * Patches n8n workflow JSON so workflow name/version come from the Fastify trigger
 * body (Platform Settings) instead of hardcoded constants.
 *
 * Usage: node n8n/scripts/patch-workflow-identity-from-settings.js
 */
const fs = require('node:fs');
const path = require('node:path');

const WORKFLOWS = [
  {
    file: 'BESTAL_RESUME_AI_SCREENING.json',
    defaultName: 'BESTAL_RESUME_AI_SCREENING',
    defaultVersion: '1.0.0',
  },
  {
    file: 'BESTAL_EVALUATION_AI_ANALYSIS.json',
    defaultName: 'BESTAL_EVALUATION_AI_ANALYSIS',
    defaultVersion: '1.0.0',
  },
  {
    file: 'BESTAL_BGV_AI_ANALYSIS.json',
    defaultName: 'BESTAL_BGV_AI_ANALYSIS',
    defaultVersion: '1.0.0',
  },
];

function patchValidateRequest(jsCode, defaultName, defaultVersion) {
  if (!jsCode.includes("const WORKFLOW_NAME = '")) {
    if (jsCode.includes('const DEFAULT_WORKFLOW_NAME')) {
      return jsCode;
    }
    throw new Error('Validate Request jsCode missing WORKFLOW_NAME constant');
  }

  let next = jsCode
    .replace(
      `const WORKFLOW_NAME = '${defaultName}';`,
      `const DEFAULT_WORKFLOW_NAME = '${defaultName}';`,
    )
    .replace(
      `const WORKFLOW_VERSION = '${defaultVersion}';`,
      `const DEFAULT_WORKFLOW_VERSION = '${defaultVersion}';`,
    );

  next = next.replace(
    'const body = req.json.body ?? req.json;\n',
    "const body = req.json.body ?? req.json;\n\nconst workflowName = String(body?.workflowName || DEFAULT_WORKFLOW_NAME).trim();\nconst workflowVersion = String(body?.workflowVersion || DEFAULT_WORKFLOW_VERSION).trim();\n",
  );

  next = next
    .replaceAll('workflowName: WORKFLOW_NAME', 'workflowName: workflowName')
    .replaceAll('workflowVersion: WORKFLOW_VERSION', 'workflowVersion: workflowVersion');

  return next;
}

function patchWorkflow({ file, defaultName, defaultVersion }) {
  const filePath = path.join(__dirname, '..', 'workflows', file);
  const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const node of workflow.nodes) {
    if (node.name === 'Validate Request' && node.parameters?.jsCode) {
      node.parameters.jsCode = patchValidateRequest(
        node.parameters.jsCode,
        defaultName,
        defaultVersion,
      );
    }

    if (node.name === 'Extract Input' && node.parameters?.assignments?.assignments) {
      for (const assignment of node.parameters.assignments.assignments) {
        if (assignment.name === 'workflowName') {
          assignment.value = '={{ $json.workflowName }}';
        }
        if (assignment.name === 'workflowVersion') {
          assignment.value = '={{ $json.workflowVersion }}';
        }
      }
    }

    if (node.name === 'Respond Trigger Accepted' && node.parameters?.responseBody) {
      node.parameters.responseBody =
        "={{ { ok: true, accepted: true, jobId: $json.jobId, ...($json.candidateId != null && Number($json.candidateId) > 0 ? { candidateId: Number($json.candidateId) } : {}), status: 'PROCESSING', workflowName: $json.workflowName, workflowVersion: $json.workflowVersion } }}";
    }

    if (node.name === 'Handle Success' && node.parameters?.jsCode) {
      node.parameters.jsCode = node.parameters.jsCode
        .replace(
          /workflowName: '[^']+',\n\s*workflowVersion: '[^']+',/,
          "workflowName: $('Prepare Callback Payload').first().json.workflowName,\n    workflowVersion: $('Prepare Callback Payload').first().json.workflowVersion,",
        );
    }

    if (node.name === 'Prepare Failure Payload' && node.parameters?.jsCode) {
      node.parameters.jsCode = node.parameters.jsCode
        .replace(
          /workflowName: '[^']+',\n\s*workflowVersion: '[^']+',/,
          'workflowName: item.workflowName,\n      workflowVersion: item.workflowVersion,',
        );
    }
  }

  fs.writeFileSync(filePath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
  console.log(`Patched ${file}`);
}

for (const spec of WORKFLOWS) {
  patchWorkflow(spec);
}
