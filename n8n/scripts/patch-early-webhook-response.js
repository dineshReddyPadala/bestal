/**
 * Adds early Respond Trigger Accepted after Input Valid? and demotes Handle Success
 * from respondToWebhook so Fastify trigger returns before OpenAI runs.
 */
const fs = require('fs');
const path = require('path');

const WORKFLOWS = [
  {
    file: 'BESTAL_RESUME_AI_SCREENING.json',
    workflowName: 'BESTAL_RESUME_AI_SCREENING',
    extractNode: 'Extract Input',
    callbackNode: 'Prepare Callback Payload',
  },
  {
    file: 'BESTAL_EVALUATION_AI_ANALYSIS.json',
    workflowName: 'BESTAL_EVALUATION_AI_ANALYSIS',
    extractNode: 'Extract Input',
    callbackNode: 'Prepare Callback Payload',
  },
  {
    file: 'BESTAL_BGV_AI_ANALYSIS.json',
    workflowName: 'BESTAL_BGV_AI_ANALYSIS',
    extractNode: 'Extract Input',
    callbackNode: 'Prepare Callback Payload',
  },
];

const workflowsDir = path.join(__dirname, '..', 'workflows');

for (const cfg of WORKFLOWS) {
  const filePath = path.join(workflowsDir, cfg.file);
  const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const respondNode = {
    id: 'respond-trigger-accepted',
    name: 'Respond Trigger Accepted',
    type: 'n8n-nodes-base.respondToWebhook',
    typeVersion: 1.1,
    position: [600, 180],
    parameters: {
      options: {},
      respondWith: 'json',
      responseBody: `={{ { ok: true, accepted: true, jobId: $json.jobId, ...($json.candidateId != null && Number($json.candidateId) > 0 ? { candidateId: Number($json.candidateId) } : {}), status: 'PROCESSING', workflowName: '${cfg.workflowName}', workflowVersion: '1.0.0' } }}`,
    },
  };

  const existingRespond = workflow.nodes.find((n) => n.name === 'Respond Trigger Accepted');
  if (!existingRespond) {
    workflow.nodes.push(respondNode);
  }

  const handleSuccess = workflow.nodes.find((n) => n.name === 'Handle Success');
  if (handleSuccess) {
    handleSuccess.type = 'n8n-nodes-base.code';
    handleSuccess.typeVersion = 2;
    handleSuccess.parameters = {
      jsCode: `// Webhook already answered by Respond Trigger Accepted; pipeline finished via internal callback.
return [{
  json: {
    ok: true,
    stage: 'Complete',
    jobId: $('${cfg.callbackNode}').first().json.jobId,
    workflowName: '${cfg.workflowName}',
    workflowVersion: '1.0.0',
  }
}];`,
    };
  }

  const connections = workflow.connections;
  if (connections['Input Valid?']) {
    connections['Input Valid?'].main[0] = [
      { node: 'Respond Trigger Accepted', type: 'main', index: 0 },
    ];
  }

  connections['Respond Trigger Accepted'] = {
    main: [[{ node: cfg.extractNode, type: 'main', index: 0 }]],
  };

  fs.writeFileSync(filePath, `${JSON.stringify(workflow, null, 2)}\n`);
  console.log(`Patched ${cfg.file}`);
}
