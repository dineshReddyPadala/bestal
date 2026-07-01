export type NavItem = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon?: string;
  readonly badge?: number;
  readonly children?: readonly NavItem[];
};

export type PlatformStat = {
  readonly id: string;
  readonly label: string;
  readonly value: number | string;
  readonly change?: number;
  readonly changeLabel?: string;
  readonly format?: 'number' | 'currency' | 'percent' | 'duration';
};

export type Testimonial = {
  readonly id: number;
  readonly quote: string;
  readonly authorName: string;
  readonly authorTitle: string;
  readonly company: string;
  readonly companyLogoUrl: string;
  readonly rating: number;
  readonly featured: boolean;
};

export type CompanyLogo = {
  readonly id: number;
  readonly name: string;
  readonly logoUrl: string;
  readonly industry: string;
  readonly featured: boolean;
};

export type PublicJob = {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly skillCommunity: string;
  readonly location: string;
  readonly remote: boolean;
  readonly engagementType: 'CONTRACT' | 'PERMANENT' | 'FREELANCE';
  readonly rateMin: number;
  readonly rateMax: number;
  readonly currency: string;
  readonly description: string;
  readonly requirements: readonly string[];
  readonly postedAt: string;
  readonly applicants: number;
};

export type MockCandidateSkill = {
  readonly skillCommunityId: number;
  readonly skillCommunityName: string;
  readonly proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  readonly yearsExperience: number;
  readonly isPrimary: boolean;
};

export type MockCandidate = {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly headline: string;
  readonly summary: string;
  readonly location: string;
  readonly yearsExperience: number;
  readonly expectedRate: number;
  readonly currency: string;
  readonly status: 'NEW' | 'ACTIVE' | 'INACTIVE' | 'PLACED' | 'DO_NOT_CONTACT';
  readonly visibility: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  readonly approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  readonly source: 'DIRECT' | 'REFERRAL' | 'LINKEDIN' | 'JOB_BOARD' | 'AGENCY';
  readonly photoUrl: string;
  readonly linkedinUrl: string;
  readonly skills: readonly MockCandidateSkill[];
  readonly availableFrom: string;
};

export type MockClient = {
  readonly id: number;
  readonly name: string;
  readonly industry: string;
  readonly website: string;
  readonly logoUrl: string;
  readonly status: 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  readonly accountManager: string;
  readonly location: string;
  readonly employeeCount: string;
  readonly activeDeployments: number;
  readonly totalSpend: number;
  readonly currency: string;
};

export type ShortlistEntry = {
  readonly candidateId: number;
  readonly candidateName: string;
  readonly rank: number;
  readonly notes: string;
  readonly addedAt: string;
};

export type MockShortlist = {
  readonly id: number;
  readonly title: string;
  readonly clientId: number;
  readonly clientName: string;
  readonly status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  readonly jobTitle: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly entries: readonly ShortlistEntry[];
};

export type MockEvaluation = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly evaluatorName: string;
  readonly skillCommunity: string;
  readonly status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  readonly recommendation: 'STRONG_HIRE' | 'HIRE' | 'NEUTRAL' | 'NO_HIRE' | 'STRONG_NO_HIRE' | null;
  readonly overallScore: number | null;
  readonly technicalScore: number | null;
  readonly communicationScore: number | null;
  readonly completedAt: string | null;
  readonly notes: string;
};

export type MockInterview = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly clientId: number;
  readonly clientName: string;
  readonly type: 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TECHNICAL' | 'PANEL' | 'FINAL' | 'HR';
  readonly status: 'REQUESTED' | 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  readonly scheduledAt: string | null;
  readonly durationMinutes: number;
  readonly interviewer: string;
  readonly meetingUrl: string | null;
  readonly notes: string;
};

export type MockBackgroundCheck = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly type: 'CRIMINAL' | 'EMPLOYMENT' | 'EDUCATION' | 'REFERENCE' | 'IDENTITY' | 'CREDIT' | 'COMPREHENSIVE';
  readonly status: 'NOT_STARTED' | 'PENDING' | 'IN_PROGRESS' | 'CLEAR' | 'CONSIDER' | 'SUSPENDED' | 'FAILED' | 'CANCELLED';
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly completedAt: string | null;
  readonly provider: string;
};

export type MockDeployment = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly clientId: number;
  readonly clientName: string;
  readonly title: string;
  readonly status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'ON_HOLD';
  readonly placementType: 'CONTRACT' | 'PERMANENT' | 'TEMP_TO_PERM' | 'FREELANCE';
  readonly startDate: string;
  readonly endDate: string | null;
  readonly rate: number;
  readonly currency: string;
  readonly hoursPerWeek: number;
};

export type MockUser = {
  readonly id: number;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly role: 'ADMIN' | 'RECRUITER' | 'SALES' | 'CLIENT';
  readonly isActive: boolean;
  readonly lastLoginAt: string;
  readonly photoUrl: string;
  readonly organizationId: number;
};

export type MockOrganization = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly isActive: boolean;
  readonly memberCount: number;
  readonly clientCount: number;
  readonly candidateCount: number;
  readonly createdAt: string;
};

export type MockAuditLog = {
  readonly id: number;
  readonly action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'VIEW';
  readonly entityType: string;
  readonly entityId: number;
  readonly actorName: string;
  readonly actorEmail: string;
  readonly summary: string;
  readonly ipAddress: string;
  readonly createdAt: string;
};

export type MockNotification = {
  readonly id: number;
  readonly type: 'SYSTEM' | 'INTERVIEW' | 'SHORTLIST' | 'DEPLOYMENT' | 'DOCUMENT' | 'BACKGROUND_CHECK' | 'EVALUATION' | 'GENERAL';
  readonly title: string;
  readonly message: string;
  readonly status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  readonly channel: 'IN_APP' | 'EMAIL' | 'SMS';
  readonly userId: number;
  readonly createdAt: string;
  readonly readAt: string | null;
};

export type MockApproval = {
  readonly id: number;
  readonly type: 'CANDIDATE' | 'SHORTLIST' | 'TRIAL' | 'DEPLOYMENT';
  readonly title: string;
  readonly description: string;
  readonly status: 'PENDING' | 'APPROVED' | 'REJECTED';
  readonly requestedBy: string;
  readonly requestedAt: string;
  readonly reviewedBy: string | null;
  readonly reviewedAt: string | null;
  readonly entityId: number;
  readonly clientId: number;
  readonly clientName: string;
};

export type MockSkillCommunity = {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly candidateCount: number;
  readonly activeJobs: number;
  readonly avgRate: number;
  readonly currency: string;
  readonly icon: string;
  readonly featured: boolean;
};

export type AdminKpi = {
  readonly id: string;
  readonly label: string;
  readonly value: number | string;
  readonly change?: number;
  readonly changeLabel?: string;
  readonly format?: 'number' | 'currency' | 'percent';
};

export type ChartDataPoint = {
  readonly label: string;
  readonly value: number;
  readonly value2?: number;
};

export type MockTrial = {
  readonly id: number;
  readonly candidateId: number;
  readonly candidateName: string;
  readonly clientId: number;
  readonly clientName: string;
  readonly title: string;
  readonly status: 'REQUESTED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXTENDED';
  readonly startDate: string;
  readonly endDate: string;
  readonly rate: number;
  readonly currency: string;
  readonly hoursPerWeek: number;
  readonly feedback: string | null;
  readonly recruiter: string;
};
