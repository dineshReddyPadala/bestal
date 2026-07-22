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

export type BgvExtractionFormPatch = {
  vendorName?: string;
  checkType?: string;
  aiBgvSummary?: string;
  concernNotes?: string;
  resultSummary?: string;
  initiatedAt?: string;
  completedAt?: string;
};
