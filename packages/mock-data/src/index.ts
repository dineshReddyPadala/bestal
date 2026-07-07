export type {
  NavItem,
  PlatformStat,
  Testimonial,
  CompanyLogo,
  PublicJob,
  MockCandidateSkill,
  MockCandidate,
  MockClient,
  ShortlistEntry,
  MockShortlist,
  MockEvaluation,
  MockInterview,
  MockBackgroundCheck,
  MockDeployment,
  MockUser,
  MockOrganization,
  MockAuditLog,
  MockNotification,
  MockApproval,
  MockSkillCommunity,
  AdminKpi,
  ChartDataPoint,
  MockTrial,
  MockDocument,
  MockScreeningResult,
  MockCandidatePricing,
  MockAvailability,
  MockSalesDeal,
} from './types.js';

export {
  adminKpis,
  adminDashboardStats,
  revenueByMonth,
  deploymentTrend,
  monthlyDeployments,
  pipelineByStage,
  evaluationsByStatus,
  candidatesByCommunity,
  candidatesByAvailability,
  candidatesByStatus,
  latestCandidateUploads,
  latestAiScreenings,
  latestEvaluations,
  latestBgvUpdates,
  latestClientRequests,
  latestTrialRequests,
  latestDeployments,
  dashboardNotifications,
  type AdminKpis,
  type DashboardActivity,
} from './adminDashboard.js';
export { trials, type Trials } from './trials.js';
export {
  trialRequestRecords,
  trialRequestClients,
  trialRequestCandidates,
  trialRequestStatuses,
  getTrialRequestById,
  type TrialRequestRecord,
  type TrialRequestStatus,
} from './trialRequestManagement.js';
export { candidateScores, getBestalScore } from './candidateScores.js';

export { stats, type Stats } from './stats.js';
export { testimonials, type Testimonials } from './testimonials.js';
export { companies, type Companies } from './companies.js';
export { publicJobs, type PublicJobs } from './publicJobs.js';
export { candidates, type Candidates } from './candidates.js';
export {
  candidateDetailProfiles,
  getCandidateDetailProfile,
  type CandidateDetailProfile,
  type CandidateProjectHighlight,
  type CandidateCertification,
  type CandidateTimelineEvent,
  type CandidateActivityEvent,
} from './candidateDetailProfile.js';
export {
  candidateListingRecords,
  candidateListingCommunities,
  candidateListingSkills,
  candidateListingTimezones,
  getCandidateListRecord,
  type CandidateListRecord,
  type AvailabilityCategory,
} from './candidateListing.js';
export { clients, type Clients } from './clients.js';
export { companyLogoUrl } from './company-logos.js';
export {
  clientManagementRecords,
  clientIndustries,
  clientManagers,
  clientStatuses,
  getClientManagementById,
  formatPaymentTerms,
  type ClientManagementRecord,
  type ClientManagementStatus,
  type PaymentTerms,
} from './clientManagement.js';
export {
  clientDashboard,
  getClientDashboard,
  type ClientDashboardData,
  type ClientDashboardStat,
  type ClientRecommendedCandidate,
  type ClientActivityItem,
  type ClientNotification,
  type ClientAccountManager,
  type ClientInterviewSummary,
  type ClientPilotSummary,
} from './clientDashboard.js';
export {
  getClientSearchRecords,
  clientSearchRoles,
  clientSearchSkills,
  clientSearchCommunities,
  clientSearchTimezones,
  type ClientSearchRecord,
} from './clientCandidateSearch.js';
export {
  getClientCandidateProfile,
  type ClientCandidateProfile,
  type ClientGroupedSkill,
  type ClientBgvCheck,
} from './clientCandidateProfile.js';
export { shortlists, type Shortlists } from './shortlists.js';
export { evaluations, type Evaluations } from './evaluations.js';
export {
  evaluationManagementRecords,
  evaluationCandidates,
  evaluationEvaluators,
  evaluationTypes,
  evaluationStatuses,
  evaluationRecommendations,
  getEvaluationManagementById,
  type EvaluationManagementRecord,
  type EvaluationManagementStatus,
  type EvaluationType,
} from './evaluationManagement.js';
export { interviews, type Interviews } from './interviews.js';
export { backgroundChecks, type BackgroundChecks } from './backgroundChecks.js';
export {
  backgroundVerificationRecords,
  bgvCandidates,
  bgvVendors,
  bgvOverallStatuses,
  getBackgroundVerificationById,
  type BackgroundVerificationRecord,
  type BgvOverallStatus,
  type BgvCheckStatus,
} from './backgroundVerificationManagement.js';
export { deployments, type Deployments } from './deployments.js';
export {
  deploymentManagementRecords,
  deploymentClients,
  deploymentCandidates,
  deploymentStatuses,
  getDeploymentManagementById,
  formatDeploymentTimezone,
  type DeploymentManagementRecord,
  type DeploymentStatus,
} from './deploymentManagement.js';
export { users, type Users } from './users.js';
export { organizations, type Organizations } from './organizations.js';
export { auditLogs, type AuditLogs } from './auditLogs.js';
export { notifications, type Notifications } from './notifications.js';
export { approvals, type Approvals } from './approvals.js';
export { skillCommunities, type SkillCommunities } from './skillCommunities.js';
export { documents, getDocumentsForCandidate, type Documents } from './documents.js';
export {
  screeningResults,
  getScreeningForCandidate,
  type ScreeningResults,
} from './screening.js';
export {
  candidatePricing,
  getPricingForCandidate,
  computeMarginPercent,
  type CandidatePricing,
} from './pricing.js';
export {
  candidateAvailability,
  getAvailabilityForCandidate,
  type CandidateAvailability,
} from './availability.js';
export { salesDeals, type SalesDeals } from './salesPipeline.js';
export {
  schemaCandidates,
  schemaClients,
  getSchemaCandidate,
  getSchemaClient,
  getSchemaUserName,
} from './schema-records.js';
export {
  schemaDocuments,
  schemaDeployments,
  schemaTrialRequests,
  schemaInterviewRequests,
  schemaEvaluations,
  schemaBackgroundChecks,
  schemaShortlists,
  schemaUsers,
  schemaOrganizations,
  schemaAuditLogs,
  schemaNotifications,
  getSchemaDocumentsForCandidate,
  getSchemaEvaluationsForCandidate,
  getSchemaBackgroundChecksForCandidate,
  getSchemaDeploymentsForCandidate,
  getSchemaTrialsForCandidate,
  getSchemaInterviewsForCandidate,
} from './schema-entities.js';
export type {
  SchemaCandidate,
  SchemaCandidateSkill,
  SchemaClient,
  SchemaDocument,
  SchemaDeployment,
  SchemaTrialRequest,
  SchemaInterviewRequest,
  SchemaEvaluation,
  SchemaBackgroundCheck,
  SchemaShortlist,
  SchemaUser,
  SchemaOrganization,
  SchemaAuditLog,
  SchemaNotification,
} from './schema-types.js';
export {
  adminNav,
  recruiterNav,
  clientNav,
  salesNav,
  publicNav,
  type AdminNav,
  type RecruiterNav,
  type ClientNav,
  type SalesNav,
  type PublicNav,
} from './nav.js';
