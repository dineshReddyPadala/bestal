export type BgvExtractionResponse = {
  jobId: string;
  confidence: number;
  extractedAt: string;
  id?: string;
  candidateId?: string;
  vendorName?: string;
  status?: string;
  idCheckStatus?: string;
  employmentCheckStatus?: string;
  criminalCheckStatus?: string;
  reportUrl?: string | null;
  aiBgvSummary: string;
  concernNotes?: string;
  initiatedDate?: string;
  completedDate?: string;
  checkType?: string;
  warnings: string[];
};
