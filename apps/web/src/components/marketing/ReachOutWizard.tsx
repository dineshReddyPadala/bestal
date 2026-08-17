import { ArrowLeft, Upload, X } from 'lucide-react';
import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForwardArrow } from '../ui/ForwardArrow';

const STEPS = [
  { id: 1, label: 'Job Details' },
  { id: 2, label: 'Client Details' },
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

const PERSONAL_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

type FormState = {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string;
  experienceRequired: string;
  numberOfResources: string;
  companyName: string;
  clientName: string;
  email: string;
  phone: string;
  additionalRequirements: string;
};

const INITIAL_FORM: FormState = {
  jobTitle: '',
  jobDescription: '',
  requiredSkills: '',
  experienceRequired: '',
  numberOfResources: '',
  companyName: '',
  clientName: '',
  email: '',
  phone: '',
  additionalRequirements: '',
};

function isWorkEmail(email: string) {
  const domain = email.split('@')[1]?.toLowerCase();
  return !domain || !PERSONAL_EMAIL_DOMAINS.includes(domain);
}

export function ReachOutWizard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const update = useCallback((patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setStep(1);
    setForm(INITIAL_FORM);
    setFiles([]);
    setEmailError(false);
    setFileError(null);
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (step === 2) {
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
    if (!nextFiles?.length) {
      setFiles([]);
      setFileError(null);
      return;
    }

    const accepted: File[] = [];
    for (const file of Array.from(nextFiles)) {
      if (file.size > MAX_FILE_BYTES) {
        setFileError('Each file must be 10MB or smaller.');
        return;
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
        setFileError('Only PDF, DOC, and DOCX files are allowed.');
        return;
      }
      accepted.push(file);
    }
    setFileError(null);
    setFiles(accepted);
  }

  function handleFinalSubmit() {
    if (step !== 3) return;
    if (fileError) return;
    if (!validateCurrentStepFields()) return;
    if (!isWorkEmail(form.email.trim())) {
      setEmailError(true);
      setStep(2);
      return;
    }
    setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="mkt-reach-out">
        <div className="mkt-reach-out-card">
          <h3 className="mkt-reach-out-success-title">Details received.</h3>
          <p className="mkt-reach-out-success-body">
            Our talent team will review your requirement and reach out on business days.
          </p>
          <div className="mkt-reach-out-footer">
            <button type="button" className="mkt-btn mkt-btn-primary" onClick={reset}>
              Submit another requirement
            </button>
            <Link to="/" className="mkt-btn mkt-btn-secondary">
              Back to home
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
        </nav>

        <div className="mkt-reach-out-hd">
          <div>
            <h2 className="mkt-reach-out-title">
              {step === 1 && 'Job Details'}
              {step === 2 && 'Client Details'}
              {step === 3 && 'Additional Information'}
            </h2>
            <p className="mkt-reach-out-sub">
              {step === 1 && 'What role are you hiring for?'}
              {step === 2 && 'So our talent team can reach you.'}
              {step === 3 && 'Optional — attach a JD or add specific requirements.'}
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
            <>
              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Job title <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={form.jobTitle}
                  placeholder="e.g. Senior Data Engineer"
                  onChange={(e) => update({ jobTitle: e.target.value })}
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
                  value={form.jobDescription}
                  placeholder="Type your message here."
                  onChange={(e) => update({ jobDescription: e.target.value })}
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
                  value={form.requiredSkills}
                  placeholder="Search and select skills"
                  onChange={(e) => update({ requiredSkills: e.target.value })}
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
                    value={form.experienceRequired}
                    onChange={(e) => update({ experienceRequired: e.target.value })}
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
                    value={form.numberOfResources}
                    onChange={(e) => update({ numberOfResources: e.target.value })}
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
            </>
          )}

          {step === 2 && (
            <div className="mkt-reach-out-grid">
              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Company name <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  placeholder="Enter name"
                  onChange={(e) => update({ companyName: e.target.value })}
                  className="mkt-reach-out-input"
                />
              </label>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Client name <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="text"
                  required
                  value={form.clientName}
                  placeholder="Enter name"
                  onChange={(e) => update({ clientName: e.target.value })}
                  className="mkt-reach-out-input"
                />
              </label>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">
                  Email <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="email"
                  required
                  value={form.email}
                  placeholder="eg. example@gmail.com"
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
                  Phone Number <span className="mkt-reach-out-req">*</span>
                </span>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  placeholder="Value"
                  onChange={(e) => update({ phone: e.target.value })}
                  className="mkt-reach-out-input"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="mkt-reach-out-step3" key="step-3">
              <div className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">Upload JD/ Supporting Documents</span>
                <label
                  className="mkt-reach-out-upload"
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
                    <span className="mkt-reach-out-upload-meta">
                      {files.length ? files.map((f) => f.name).join(', ') : 'No file chosen'}
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
                {fileError && <p className="mkt-reach-out-error">{fileError}</p>}
              </div>

              <label className="mkt-reach-out-field">
                <span className="mkt-reach-out-label">Additional Requirements</span>
                <textarea
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
              <button type="button" className="mkt-btn mkt-btn-primary" onClick={handleFinalSubmit}>
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
