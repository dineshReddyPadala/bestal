import { ArrowLeft, Check, CheckCircle2, Copy, FileText, Plus, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForwardArrow } from '../ui/ForwardArrow';

const WHAT_HAPPENS_NEXT = [
  'Requirement Review',
  'Resource Evaluation',
  'Consultant Assignment',
  'Team Contact',
] as const;

function createRequestId() {
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return `REQ-${new Date().getFullYear()}-${suffix}`;
}

const STEPS = [
  { id: 1, label: 'Company Details' },
  { id: 2, label: 'Job Details' },
  { id: 3, label: 'Additional Information' },
] as const;

const EXPERIENCE_OPTIONS = [
  { value: '', label: 'Select type' },
  { value: '0-2', label: 'Less than 2 years' },
  { value: '2-5', label: '2–5 years' },
  { value: '5-8', label: '5–8 years' },
  { value: '8+', label: '8+ years' },
];

const RESOURCE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5+', label: '5+' },
];

const TIMEZONE_OPTIONS = [
  { value: '', label: 'Select time zone' },
  { value: 'Eastern', label: 'Eastern (ET)' },
  { value: 'Central', label: 'Central (CT)' },
  { value: 'Mountain', label: 'Mountain (MT)' },
  { value: 'Pacific', label: 'Pacific (PT)' },
];

const PERSONAL_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

type JobEntry = {
  id: string;
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string;
  experienceRequired: string;
  numberOfResources: string;
};

type FormState = {
  companyName: string;
  companyDomain: string;
  location: string;
  timezone: string;
  companyWebsite: string;
  contactPersonName: string;
  email: string;
  phone: string;
  jobs: JobEntry[];
  additionalRequirements: string;
};

function createEmptyJob(id: string): JobEntry {
  return {
    id,
    jobTitle: '',
    jobDescription: '',
    requiredSkills: '',
    experienceRequired: '',
    numberOfResources: '',
  };
}

const INITIAL_FORM: FormState = {
  companyName: '',
  companyDomain: '',
  location: '',
  timezone: '',
  companyWebsite: '',
  contactPersonName: '',
  email: '',
  phone: '',
  jobs: [createEmptyJob('job-1')],
  additionalRequirements: '',
};

function isWorkEmail(email: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  return !domain || !PERSONAL_EMAIL_DOMAINS.includes(domain);
}

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReachOutWizard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimersRef = useRef<Map<string, number>>(new Map());
  const nextJobId = useRef(2);
  const nextUploadId = useRef(1);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestIdCopied, setRequestIdCopied] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadRequiredError, setUploadRequiredError] = useState(false);

  const clearUploadTimers = useCallback(() => {
    uploadTimersRef.current.forEach((timerId) => window.clearInterval(timerId));
    uploadTimersRef.current.clear();
  }, []);

  useEffect(() => () => clearUploadTimers(), [clearUploadTimers]);

  const startUploadSimulation = useCallback((uploadId: string, fileSize: number) => {
    const stepMs = 80;
    const increment = Math.max(4, Math.min(18, Math.round(800_000 / fileSize)));

    const timerId = window.setInterval(() => {
      setUploads((current) => {
        let finished = false;
        const next = current.map((item) => {
          if (item.id !== uploadId || item.status !== 'uploading') return item;
          const progress = Math.min(item.progress + increment, 100);
          if (progress >= 100) {
            finished = true;
            return { ...item, progress: 100, status: 'complete' as const };
          }
          return { ...item, progress };
        });
        if (finished) {
          const existing = uploadTimersRef.current.get(uploadId);
          if (existing) {
            window.clearInterval(existing);
            uploadTimersRef.current.delete(uploadId);
          }
        }
        return next;
      });
    }, stepMs);

    uploadTimersRef.current.set(uploadId, timerId);
  }, []);

  const update = useCallback((patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setStep(1);
    setForm({
      ...INITIAL_FORM,
      jobs: [createEmptyJob('job-1')],
    });
    clearUploadTimers();
    setUploads([]);
    setEmailError(false);
    setFileError(null);
    setUploadRequiredError(false);
    setSubmitted(false);
    setRequestId(null);
    setRequestIdCopied(false);
    nextJobId.current = 2;
    nextUploadId.current = 1;
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [clearUploadTimers]);

  const addJob = useCallback(() => {
    setForm((current) => ({
      ...current,
      jobs: [...current.jobs, createEmptyJob(`job-${nextJobId.current++}`)],
    }));
  }, []);

  const updateJob = useCallback((id: string, patch: Partial<Omit<JobEntry, 'id'>>) => {
    setForm((current) => ({
      ...current,
      jobs: current.jobs.map((job) => (job.id === id ? { ...job, ...patch } : job)),
    }));
  }, []);

  const removeJob = useCallback((id: string) => {
    setForm((current) => {
      if (current.jobs.length <= 1) return current;
      return { ...current, jobs: current.jobs.filter((job) => job.id !== id) };
    });
  }, []);

  function validateCurrentStepFields() {
    const fields = document.querySelectorAll(
      '.mkt-reach-out-body input, .mkt-reach-out-body textarea, .mkt-reach-out-body select',
    );
    for (const field of fields) {
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      ) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
    }
    return true;
  }

  function goNext() {
    if (!validateCurrentStepFields()) return;
    if (step === 1) {
      if (!isWorkEmail(form.email.trim())) {
        setEmailError(true);
        return;
      }
      setEmailError(false);
    }
    setStep((s) => Math.min(s + 1, 3));
  }

  function goPrevious() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function handleFiles(nextFiles: FileList | null) {
    if (!nextFiles?.length) return;

    const accepted: UploadItem[] = [];
    for (const file of Array.from(nextFiles)) {
      if (file.size > MAX_FILE_BYTES) {
        setFileError('Each file must be 10MB or smaller.');
        return;
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
        setFileError('Only PDF, DOC, and DOCX files are allowed.');
        return;
      }

      const uploadId = `upload-${nextUploadId.current++}`;
      accepted.push({
        id: uploadId,
        file,
        progress: 0,
        status: 'uploading',
      });
    }

    setFileError(null);
    setUploadRequiredError(false);
    setUploads((current) => [...current, ...accepted]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    accepted.forEach((item) => startUploadSimulation(item.id, item.file.size));
  }

  function removeUpload(uploadId: string) {
    const timerId = uploadTimersRef.current.get(uploadId);
    if (timerId) {
      window.clearInterval(timerId);
      uploadTimersRef.current.delete(uploadId);
    }
    setUploads((current) => current.filter((item) => item.id !== uploadId));
  }

  function handleFinalSubmit() {
    if (step !== 3) return;
    if (fileError) return;
    if (uploads.some((item) => item.status === 'uploading')) return;

    const hasCompletedUpload = uploads.some((item) => item.status === 'complete');
    if (!hasCompletedUpload) {
      setUploadRequiredError(true);
      return;
    }
    setUploadRequiredError(false);

    if (!validateCurrentStepFields()) return;
    if (!isWorkEmail(form.email.trim())) {
      setEmailError(true);
      setStep(1);
      return;
    }
    setRequestId(createRequestId());
    setSubmitted(true);
  }

  async function copyRequestId() {
    if (!requestId) return;
    try {
      await navigator.clipboard.writeText(requestId);
      setRequestIdCopied(true);
      window.setTimeout(() => setRequestIdCopied(false), 2000);
    } catch {
      setRequestIdCopied(false);
    }
  }

  function handleStepKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const target = e.target;
    if (target instanceof HTMLTextAreaElement) return;
    if (step < 3) {
      e.preventDefault();
      goNext();
    }
  }

  if (submitted && requestId) {
    return (
      <div className="mkt-reach-out">
        <div className="mkt-reach-out-card mkt-reach-out-success-card">
          <button
            type="button"
            className="mkt-reach-out-success-close"
            aria-label="Close"
            onClick={() => navigate('/')}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mkt-reach-out-success-icon" aria-hidden="true">
            <CheckCircle2 strokeWidth={2} />
          </div>

          <h3 className="mkt-reach-out-success-title">Details received.</h3>
          <p className="mkt-reach-out-success-body">
            Our talent team will review your requirement and reach out on business days.
          </p>


          <div className="mkt-reach-out-success-next">
            <h4>What happens next?</h4>
            <ul>
              {WHAT_HAPPENS_NEXT.map((item) => (
                <li key={item}>
                  <span className="mkt-reach-out-success-check" aria-hidden="true">
                    <Check strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mkt-reach-out-success-actions">
            <button type="button" className=" mkt-btn mkt-btn-primary" onClick={reset}>
              Submit another requirement
            </button>
            <Link to="/" className="mkt-btn mkt-btn-secondary">
              Back to home
              <ForwardArrow />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mkt-reach-out">
      <div className="mkt-reach-out-card" onKeyDown={handleStepKeyDown}>
        <nav className="mkt-reach-out-steps" aria-label="Form progress">
          {STEPS.map((item) => {
            const isActive = item.id === step;
            const isComplete = item.id < step;
            return (
              <div
                key={item.id}
                className={`mkt-reach-out-step${isActive ? ' is-active' : ''}${isComplete ? ' is-complete' : ''}`}
              >
                <span className="mkt-reach-out-step-n">{item.id}</span>
                <span className="mkt-reach-out-step-l">{item.label}</span>
              </div>
            );
          })}
          {step === 2 && (
            <button
              type="button"
              className="mkt-reach-out-add-job mkt-reach-out-add-job--stepper"
              onClick={addJob}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add another role
            </button>
          )}
        </nav>

        <div className="mkt-reach-out-hd">
          <div>
            <h2 className="mkt-reach-out-title">
              {step === 1 && 'Company Details'}
              {step === 2 && 'Job Details'}
              {step === 3 && 'Additional Information'}
            </h2>
            <p className="mkt-reach-out-sub">
              {step === 1 && 'Tell us about your company so our talent team can reach you.'}
              {step === 2 && 'What role are you hiring for?'}
              {step === 3 && 'Attach a JD and add any specific requirements.'}
            </p>
          </div>
          <button
            type="button"
            className="mkt-reach-out-close"
            aria-label="Close form"
            onClick={() => navigate('/')}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mkt-reach-out-body" key={`step-body-${step}`}>
          {step === 1 && (
            <div className="mkt-reach-out-grid">
              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Company name <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  placeholder="Enter company name"
                  onChange={(e) => update({ companyName: e.target.value })}
                  className="mkt-reach-out-input"
                />
              </label>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Company domain <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={form.companyDomain}
                  placeholder="e.g. bestal.com"
                  onChange={(e) => update({ companyDomain: e.target.value })}
                  className="mkt-reach-out-input"
                />
              </label>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Location <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={form.location}
                  placeholder="City, state or country"
                  onChange={(e) => update({ location: e.target.value })}
                  className="mkt-reach-out-input"
                />
              </label>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Time zone <span className="mkt-reach-out-req">*</span>
                </span>
                <select
                  required
                  value={form.timezone}
                  onChange={(e) => update({ timezone: e.target.value })}
                  className="mkt-reach-out-select"
                >
                  {TIMEZONE_OPTIONS.map((opt) => (
                    <option key={opt.value || 'empty'} value={opt.value} disabled={!opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mkt-reach-out-row mkt-reach-out-field--full">
                <label className="mkt-reach-out-field">
                  <span className="mkt-reach-out-label">
                    Contact person name <span className="mkt-reach-out-req">*</span>
                  </span>
                  <input
                    type="text"
                    required
                    value={form.contactPersonName}
                    placeholder="Enter contact name"
                    onChange={(e) => update({ contactPersonName: e.target.value })}
                    className="mkt-reach-out-input"
                  />
                </label>

                <label className="mkt-reach-out-field">
                  <span className="mkt-reach-out-label">
                    Company website <span className="mkt-reach-out-req">*</span>
                  </span>
                  <input
                    type="url"
                    required
                    value={form.companyWebsite}
                    placeholder="https://www.company.com"
                    onChange={(e) => update({ companyWebsite: e.target.value })}
                    className="mkt-reach-out-input"
                  />
                </label>
              </div>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Email <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="email"
                  required
                  value={form.email}
                  placeholder="eg. name@company.com"
                  onChange={(e) => {
                    update({ email: e.target.value });
                    if (emailError) setEmailError(false);
                  }}
                  className="mkt-reach-out-input"
                />
                {emailError && (
                  <p className="mkt-reach-out-error">
                    Please use your work email — we can&apos;t route personal addresses to the right
                    team.
                  </p>
                )}
              </label>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Phone number <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  placeholder="Enter phone number"
                  onChange={(e) => update({ phone: e.target.value })}
                  className="mkt-reach-out-input"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <>
              {form.jobs.map((job, index) => (
                <div key={job.id} className="mkt-reach-out-job-block">
                  {form.jobs.length > 1 && (
                    <div className="mkt-reach-out-job-block-hd">
                      <span className="mkt-reach-out-job-block-label">Role {index + 1}</span>
                      <button
                        type="button"
                        className="mkt-reach-out-remove-job"
                        onClick={() => removeJob(job.id)}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <label className="mkt-reach-out-field">
                    <span className="mkt-reach-out-label">
                      Job title <span className="mkt-reach-out-req">*</span>
                    </span>
                    <input
                      type="text"
                      required
                      name={`job-title-${job.id}`}
                      autoComplete="off"
                      value={job.jobTitle}
                      placeholder="e.g. Senior Data Engineer"
                      onChange={(e) => updateJob(job.id, { jobTitle: e.target.value })}
                      className="mkt-reach-out-input"
                    />
                  </label>

                  <label className="mkt-reach-out-field">
                    <span className="mkt-reach-out-label">
                      Job Description <span className="mkt-reach-out-req">*</span>
                    </span>
                    <textarea
                      required
                      rows={4}
                      name={`job-description-${job.id}`}
                      autoComplete="off"
                      value={job.jobDescription}
                      placeholder="Type your message here."
                      onChange={(e) => updateJob(job.id, { jobDescription: e.target.value })}
                      className="mkt-reach-out-textarea"
                    />
                  </label>

                  <label className="mkt-reach-out-field">
                    <span className="mkt-reach-out-label">
                      Required Skills <span className="mkt-reach-out-req">*</span>
                    </span>
                    <textarea
                      required
                      rows={3}
                      name={`job-skills-${job.id}`}
                      autoComplete="off"
                      value={job.requiredSkills}
                      placeholder="Search and select skills"
                      onChange={(e) => updateJob(job.id, { requiredSkills: e.target.value })}
                      className="mkt-reach-out-textarea"
                    />
                  </label>

                  <div className="mkt-reach-out-row">
                    <label className="mkt-reach-out-field">
                      <span className="mkt-reach-out-label">
                        Experience Required <span className="mkt-reach-out-req">*</span>
                      </span>
                      <select
                        required
                        name={`job-experience-${job.id}`}
                        autoComplete="off"
                        value={job.experienceRequired}
                        onChange={(e) => updateJob(job.id, { experienceRequired: e.target.value })}
                        className="mkt-reach-out-select"
                      >
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <option key={opt.value || 'empty'} value={opt.value} disabled={!opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="mkt-reach-out-field">
                      <span className="mkt-reach-out-label">
                        Number of Resources <span className="mkt-reach-out-req">*</span>
                      </span>
                      <select
                        required
                        name={`job-resources-${job.id}`}
                        autoComplete="off"
                        value={job.numberOfResources}
                        onChange={(e) => updateJob(job.id, { numberOfResources: e.target.value })}
                        className="mkt-reach-out-select"
                      >
                        {RESOURCE_OPTIONS.map((opt) => (
                          <option key={opt.value || 'empty'} value={opt.value} disabled={!opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </>
          )}

          {step === 3 && (
            <div className="mkt-reach-out-step3" key="step-3">
              <div className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Upload JD/ Supporting Documents <span className="mkt-reach-out-req">*</span>
                </span>
                <label
                  className={`mkt-reach-out-upload${uploadRequiredError ? ' is-error' : ''}`}
                  htmlFor="reach-out-jd-upload"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFiles(e.dataTransfer.files);
                  }}
                >
                  <Upload className="mkt-reach-out-upload-ic" aria-hidden="true" />
                  <p className="mkt-reach-out-upload-line">
                    <span className="mkt-reach-out-upload-prompt">
                      Click to upload or drag files here
                    </span>
                  </p>
                  <p className="mkt-reach-out-upload-hint">PDF, DOC, DOCX up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    id="reach-out-jd-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    className="mkt-reach-out-file-input"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>

                {uploads.length > 0 && (
                  <ul className="mkt-reach-out-upload-list" aria-live="polite">
                    {uploads.map((item) => (
                      <li key={item.id} className="mkt-reach-out-upload-item">
                        <div className="mkt-reach-out-upload-item-hd">
                          <FileText className="mkt-reach-out-upload-item-ic" aria-hidden="true" />
                          <div className="mkt-reach-out-upload-item-meta">
                            <span className="mkt-reach-out-upload-item-name">{item.file.name}</span>
                            <span className="mkt-reach-out-upload-item-size">
                              {formatFileSize(item.file.size)}
                              {item.status === 'uploading' && ` · ${item.progress}%`}
                              {item.status === 'complete' && ' · Uploaded'}
                            </span>
                          </div>
                          {item.status === 'complete' ? (
                            <CheckCircle2
                              className="mkt-reach-out-upload-item-done"
                              aria-hidden="true"
                            />
                          ) : null}
                          <button
                            type="button"
                            className="mkt-reach-out-upload-item-remove"
                            aria-label={`Remove ${item.file.name}`}
                            onClick={() => removeUpload(item.id)}
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                        {item.status === 'uploading' && (
                          <div
                            className="mkt-reach-out-upload-progress"
                            role="progressbar"
                            aria-valuenow={item.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Uploading ${item.file.name}`}
                          >
                            <span
                              className="mkt-reach-out-upload-progress-bar"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {fileError && <p className="mkt-reach-out-error">{fileError}</p>}
                {uploadRequiredError && !fileError && (
                  <p className="mkt-reach-out-error">Please upload at least one document.</p>
                )}
              </div>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Additional Requirements <span className="mkt-reach-out-req">*</span>
                </span>
                <textarea
                  required
                  rows={6}
                  value={form.additionalRequirements}
                  placeholder="Type your message here."
                  onChange={(e) => update({ additionalRequirements: e.target.value })}
                  className="mkt-reach-out-textarea mkt-reach-out-textarea-lg"
                />
                <p className="mkt-reach-out-hint">
                  Certifications, domain experience, security clearance, or interview preferences.
                </p>
              </label>
            </div>
          )}
        </div>

        <div className="mkt-reach-out-footer">
          {step === 1 ? (
            <>
              <Link to="/" className="mkt-btn mkt-btn-secondary mkt-reach-out-cancel">
                Cancel
              </Link>
              <button type="button" className="mkt-btn mkt-btn-primary" onClick={goNext}>
                Next step
                <ForwardArrow />
              </button>
            </>
          ) : step === 2 ? (
            <>
              <button
                type="button"
                className="mkt-btn mkt-btn-secondary mkt-reach-out-prev"
                onClick={goPrevious}
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Previous
              </button>
              <button type="button" className="mkt-btn mkt-btn-primary" onClick={goNext}>
                Next step
                <ForwardArrow />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="mkt-btn mkt-btn-secondary mkt-reach-out-prev"
                onClick={goPrevious}
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                className="mkt-btn mkt-btn-primary"
                onClick={handleFinalSubmit}
                disabled={uploads.some((item) => item.status === 'uploading')}
              >
                Submit Details
                <ForwardArrow />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
