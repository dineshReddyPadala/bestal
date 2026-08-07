const fs = require('fs');
const path = require('path');

const workflowPath = path.join(__dirname, '..', 'workflows', 'BESTAL_RESUME_AI_SCREENING.json');
const w = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

const validatePatch = `
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeExperienceEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const company = String(
    entry.company || entry.employer || entry.organization || entry.companyName || ''
  ).trim();
  if (!company) return null;
  return {
    company,
    title: String(entry.title || entry.role || entry.position || entry.jobTitle || '').trim(),
    startDate: entry.startDate ?? entry.start ?? entry.from ?? null,
    endDate: entry.endDate ?? entry.end ?? entry.to ?? null,
    description: entry.description ?? entry.summary ?? null,
  };
}

function normalizeEducationEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const institution = String(
    entry.institution || entry.school || entry.university || entry.college || ''
  ).trim();
  if (!institution) return null;
  return {
    institution,
    degree: entry.degree ?? entry.qualification ?? null,
    fieldOfStudy: entry.fieldOfStudy ?? entry.major ?? entry.field ?? null,
    graduationYear: entry.graduationYear ?? entry.year ?? null,
  };
}

function isCurrentJob(job) {
  const end = String(job.endDate || '').trim().toLowerCase();
  return !end || end === 'present' || end === 'current' || end === 'now' || end === 'ongoing';
}

const experienceRaw = [
  ...asArray(parsed.experience),
  ...asArray(parsed.workExperience),
  ...asArray(parsed.workHistory),
  ...asArray(parsed.employment),
  ...asArray(parsed.employmentHistory),
];
const experience = experienceRaw.map(normalizeExperienceEntry).filter(Boolean);

const educationRaw = [
  ...asArray(parsed.educationHistory),
  ...asArray(parsed.education).filter((e) => e && typeof e === 'object'),
];
const educationHistory = educationRaw.map(normalizeEducationEntry).filter(Boolean);

const currentJob = experience.find(isCurrentJob) || experience[0];
let currentCompany = String(
  parsed.currentCompany || parsed.currentEmployer || parsed.employer || currentJob?.company || ''
).trim();

if (!currentCompany && parsed.headline) {
  const headlineMatch = String(parsed.headline).match(/\\bat\\s+([^|,]+)/i);
  if (headlineMatch) currentCompany = headlineMatch[1].trim();
}

parsed.experience = experience;
parsed.educationHistory = educationHistory;
if (currentCompany) parsed.currentCompany = currentCompany;
`;

const validateReturn = `return [{
  json: {
    ok: true,
    jobId: ctx.jobId,
    candidateId: ctx.candidateId,
    documentId: ctx.documentId,
    requestedBy: ctx.requestedBy,
    workflowName: ctx.workflowName,
    workflowVersion: ctx.workflowVersion,
    ai: parsed,
  }
}];`;

const validateNode = w.nodes.find((n) => n.name === 'Validate Structured JSON');
if (!validateNode.parameters.jsCode.includes('normalizeExperienceEntry')) {
  validateNode.parameters.jsCode = validateNode.parameters.jsCode.replace(
    validateReturn,
    validatePatch + '\n' + validateReturn,
  );
}

const normalizeNode = w.nodes.find((n) => n.name === 'Normalize Skills');
if (!normalizeNode.parameters.jsCode.includes('pickCurrentCompany')) {
  let ncode = normalizeNode.parameters.jsCode.replace(
    'const ai = item.ai || {};',
    `const ai = item.ai || {};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeExperienceEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const company = String(
    entry.company || entry.employer || entry.organization || entry.companyName || ''
  ).trim();
  if (!company) return null;
  return {
    company,
    title: String(entry.title || entry.role || entry.position || entry.jobTitle || '').trim(),
    startDate: entry.startDate ?? entry.start ?? entry.from ?? null,
    endDate: entry.endDate ?? entry.end ?? entry.to ?? null,
    description: entry.description ?? entry.summary ?? null,
  };
}

function isCurrentJob(job) {
  const end = String(job.endDate || '').trim().toLowerCase();
  return !end || end === 'present' || end === 'current' || end === 'now' || end === 'ongoing';
}

function pickCurrentCompany(source, experience) {
  const direct = String(
    source.currentCompany || source.currentEmployer || source.employer || ''
  ).trim();
  if (direct) return direct;
  const currentJob = experience.find(isCurrentJob) || experience[0];
  if (currentJob?.company) return currentJob.company;
  const headline = String(source.headline || source.candidate?.headline || '').trim();
  const headlineMatch = headline.match(/\\bat\\s+([^|,]+)/i);
  return headlineMatch ? headlineMatch[1].trim() : '';
}

const experience = [
  ...asArray(ai.experience),
  ...asArray(ai.workExperience),
  ...asArray(ai.workHistory),
  ...asArray(ai.employment),
  ...asArray(ai.employmentHistory),
]
  .map(normalizeExperienceEntry)
  .filter(Boolean);

const currentCompany = pickCurrentCompany(ai, experience) || undefined;`,
  );

  ncode = ncode.replace(
    /  currentCompany: String\(ai\.currentCompany[\s\S]*?\|\| undefined,\n  experience: Array\.isArray\(ai\.experience\)[\s\S]*?\.filter\(\(job\) => job\.company\)\n    : \[\],/,
    '  currentCompany,\n  experience,',
  );

  ncode = ncode.replace(
    /  educationHistory: Array\.isArray\(ai\.educationHistory\)[\s\S]*?\.filter\(\(edu\) => edu\.institution\)\n    : \[\],/,
    `  educationHistory: [
    ...asArray(ai.educationHistory),
    ...asArray(ai.education).filter((e) => e && typeof e === 'object'),
  ]
    .map((edu) => ({
      institution: String(edu.institution || edu.school || edu.university || edu.college || '').trim(),
      degree: edu.degree ?? edu.qualification ?? null,
      fieldOfStudy: edu.fieldOfStudy ?? edu.major ?? edu.field ?? null,
      graduationYear: edu.graduationYear ?? edu.year ?? null,
    }))
    .filter((edu) => edu.institution),`,
  );

  normalizeNode.parameters.jsCode = ncode;
}

const prepareNode = w.nodes.find((n) => n.name === 'Prepare AI Prompt');
prepareNode.parameters.jsCode = prepareNode.parameters.jsCode.replace(
  '- Extract currentCompany from the most recent role; include experience[] (newest first) and educationHistory[].\\n',
  '- currentCompany MUST be the employer from the most recent/current role (never empty when work history exists).\\n- experience[] MUST list jobs newest-first with company + title on every row.\\n- educationHistory[] MUST list degrees with institution.\\n',
);

fs.writeFileSync(workflowPath, `${JSON.stringify(w, null, 2)}\n`);
console.log('Patched BESTAL_RESUME_AI_SCREENING.json');
