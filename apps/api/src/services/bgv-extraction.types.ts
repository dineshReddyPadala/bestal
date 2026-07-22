export type BgvExtractionRequestBody = {
  fileName: string;
  mimeType: string;
  content: string;
  candidateId?: string;
  jobId?: string;
};

/** Unified BGV extraction response (camelCase) matching ai-service + web form. */
export type BgvExtractionResponse = {
  jobId: string;
  confidence: number;
  extractedAt: string;
  id?: string;
  candidateId?: string;
  vendorName?: string;
  status?: string;
  idCheckStatus?: string;
  addressCheckStatus?: string;
  employmentCheckStatus?: string;
  educationCheckStatus?: string;
  criminalCheckStatus?: string;
  referenceCheckStatus?: string;
  reportUrl?: string | null;
  aiBgvSummary: string;
  concernNotes?: string;
  initiatedDate?: string;
  completedDate?: string;
  checkType?: string;
  warnings: string[];
};
