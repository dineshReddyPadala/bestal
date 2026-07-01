-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'RECRUITER', 'SALES', 'CLIENT');

-- CreateEnum
CREATE TYPE "Portal" AS ENUM ('ADMIN', 'RECRUITER', 'SALES', 'CLIENT');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('NEW', 'ACTIVE', 'INACTIVE', 'PLACED', 'DO_NOT_CONTACT');

-- CreateEnum
CREATE TYPE "CandidateVisibility" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "CandidateApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentKind" AS ENUM ('GENERAL', 'RESUME', 'PROFILE_IMAGE', 'INTRO_VIDEO');

-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('DIRECT', 'REFERRAL', 'JOB_BOARD', 'LINKEDIN', 'AGENCY', 'INTERNAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EvaluationRecommendation" AS ENUM ('STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'CLEAR', 'CONSIDER', 'SUSPENDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BackgroundCheckType" AS ENUM ('CRIMINAL', 'EMPLOYMENT', 'EDUCATION', 'REFERENCE', 'IDENTITY', 'CREDIT', 'COMPREHENSIVE');

-- CreateEnum
CREATE TYPE "ShortlistStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InterviewRequestStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'PANEL', 'FINAL', 'HR');

-- CreateEnum
CREATE TYPE "TrialRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeploymentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'TERMINATED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('CONTRACT', 'PERMANENT', 'TEMP_TO_PERM', 'FREELANCE');

-- CreateEnum
CREATE TYPE "DocumentEntityType" AS ENUM ('CANDIDATE', 'CLIENT', 'DEPLOYMENT', 'EVALUATION', 'BACKGROUND_CHECK', 'INTERVIEW_REQUEST', 'TRIAL_REQUEST', 'USER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'INTERVIEW', 'SHORTLIST', 'TRIAL', 'DEPLOYMENT', 'DOCUMENT', 'BACKGROUND_CHECK', 'EVALUATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'APPROVE', 'REJECT', 'ASSIGN', 'UNASSIGN');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "role" "Role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "account_manager_id" BIGINT,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'PROSPECT',
    "industry" VARCHAR(100),
    "website" VARCHAR(255),
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(30),
    "address_line1" VARCHAR(255),
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_communities" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "skill_communities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "primary_skill_community_id" BIGINT,
    "resume_document_id" BIGINT,
    "profile_image_document_id" BIGINT,
    "intro_video_document_id" BIGINT,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "status" "CandidateStatus" NOT NULL DEFAULT 'NEW',
    "visibility" "CandidateVisibility" NOT NULL DEFAULT 'DRAFT',
    "approval_status" "CandidateApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "source" "CandidateSource" NOT NULL DEFAULT 'DIRECT',
    "headline" VARCHAR(255),
    "summary" TEXT,
    "location" VARCHAR(255),
    "years_experience" INTEGER,
    "available_from" DATE,
    "expected_rate" DECIMAL(12,2),
    "currency" VARCHAR(3) DEFAULT 'USD',
    "linkedin_url" VARCHAR(500),
    "published_at" TIMESTAMP(3),
    "hidden_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by_id" BIGINT,
    "rejected_at" TIMESTAMP(3),
    "rejected_by_id" BIGINT,
    "rejection_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" BIGSERIAL NOT NULL,
    "candidate_id" BIGINT NOT NULL,
    "skill_community_id" BIGINT NOT NULL,
    "proficiency_level" "ProficiencyLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "years_experience" INTEGER,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "candidate_id" BIGINT NOT NULL,
    "client_id" BIGINT,
    "evaluator_id" BIGINT NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'DRAFT',
    "recommendation" "EvaluationRecommendation",
    "overall_score" DECIMAL(5,2),
    "technical_score" DECIMAL(5,2),
    "soft_skill_score" DECIMAL(5,2),
    "summary" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "evaluated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_checks" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "candidate_id" BIGINT NOT NULL,
    "requested_by_id" BIGINT NOT NULL,
    "type" "BackgroundCheckType" NOT NULL,
    "status" "BackgroundCheckStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "provider" VARCHAR(100),
    "external_reference_id" VARCHAR(255),
    "result_summary" TEXT,
    "initiated_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "background_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortlists" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "client_id" BIGINT NOT NULL,
    "created_by_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "ShortlistStatus" NOT NULL DEFAULT 'DRAFT',
    "role_title" VARCHAR(255),
    "due_date" DATE,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "shortlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shortlist_candidates" (
    "id" BIGSERIAL NOT NULL,
    "shortlist_id" BIGINT NOT NULL,
    "candidate_id" BIGINT NOT NULL,
    "added_by_id" BIGINT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "client_notes" TEXT,
    "is_approved" BOOLEAN,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "shortlist_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_requests" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "candidate_id" BIGINT NOT NULL,
    "client_id" BIGINT NOT NULL,
    "shortlist_id" BIGINT,
    "requested_by_id" BIGINT NOT NULL,
    "assigned_to_id" BIGINT,
    "type" "InterviewType" NOT NULL,
    "status" "InterviewRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "scheduled_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "timezone" VARCHAR(50),
    "location" VARCHAR(500),
    "meeting_link" VARCHAR(500),
    "notes" TEXT,
    "feedback" TEXT,
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancel_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "interview_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trial_requests" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "candidate_id" BIGINT NOT NULL,
    "client_id" BIGINT NOT NULL,
    "deployment_id" BIGINT,
    "requested_by_id" BIGINT NOT NULL,
    "status" "TrialRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "role_title" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "duration_days" INTEGER,
    "feedback" TEXT,
    "outcome" VARCHAR(500),
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "reject_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "trial_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployments" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "candidate_id" BIGINT NOT NULL,
    "client_id" BIGINT NOT NULL,
    "created_by_id" BIGINT NOT NULL,
    "status" "DeploymentStatus" NOT NULL DEFAULT 'PENDING',
    "placement_type" "PlacementType" NOT NULL DEFAULT 'CONTRACT',
    "role_title" VARCHAR(255) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "billing_rate" DECIMAL(12,2),
    "currency" VARCHAR(3) DEFAULT 'USD',
    "work_location" VARCHAR(255),
    "notes" TEXT,
    "terminated_at" TIMESTAMP(3),
    "terminate_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT NOT NULL,
    "uploaded_by_id" BIGINT NOT NULL,
    "entity_type" "DocumentEntityType" NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "kind" "DocumentKind" NOT NULL DEFAULT 'GENERAL',
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "s3_key" VARCHAR(500) NOT NULL,
    "s3_bucket" VARCHAR(100) NOT NULL,
    "mime_type" VARCHAR(127) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "description" VARCHAR(500),
    "verified_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "reject_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT,
    "user_id" BIGINT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" VARCHAR(500),
    "metadata" JSONB,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "organization_id" BIGINT,
    "actor_id" BIGINT,
    "action" "AuditAction" NOT NULL,
    "resource_type" VARCHAR(100) NOT NULL,
    "resource_id" BIGINT,
    "description" VARCHAR(500),
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "users_is_active_deleted_at_idx" ON "users"("is_active", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_deleted_at_idx" ON "organizations"("deleted_at");

-- CreateIndex
CREATE INDEX "organizations_is_active_deleted_at_idx" ON "organizations"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "memberships_organization_id_role_idx" ON "memberships"("organization_id", "role");

-- CreateIndex
CREATE INDEX "memberships_user_id_is_active_idx" ON "memberships"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_user_id_organization_id_key" ON "memberships"("user_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_revoked_at_idx" ON "refresh_tokens"("user_id", "revoked_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_used_at_idx" ON "password_reset_tokens"("user_id", "used_at");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "clients_organization_id_status_deleted_at_idx" ON "clients"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "clients_account_manager_id_idx" ON "clients"("account_manager_id");

-- CreateIndex
CREATE INDEX "clients_organization_id_name_idx" ON "clients"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "clients_organization_id_slug_key" ON "clients"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "skill_communities_organization_id_is_active_deleted_at_idx" ON "skill_communities"("organization_id", "is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "skill_communities_organization_id_name_idx" ON "skill_communities"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_communities_organization_id_slug_key" ON "skill_communities"("organization_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_resume_document_id_key" ON "candidates"("resume_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_profile_image_document_id_key" ON "candidates"("profile_image_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_intro_video_document_id_key" ON "candidates"("intro_video_document_id");

-- CreateIndex
CREATE INDEX "candidates_organization_id_status_deleted_at_idx" ON "candidates"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "candidates_organization_id_visibility_approval_status_delet_idx" ON "candidates"("organization_id", "visibility", "approval_status", "deleted_at");

-- CreateIndex
CREATE INDEX "candidates_organization_id_last_name_first_name_idx" ON "candidates"("organization_id", "last_name", "first_name");

-- CreateIndex
CREATE INDEX "candidates_primary_skill_community_id_idx" ON "candidates"("primary_skill_community_id");

-- CreateIndex
CREATE INDEX "candidates_organization_id_source_idx" ON "candidates"("organization_id", "source");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_organization_id_email_key" ON "candidates"("organization_id", "email");

-- CreateIndex
CREATE INDEX "candidate_skills_skill_community_id_deleted_at_idx" ON "candidate_skills"("skill_community_id", "deleted_at");

-- CreateIndex
CREATE INDEX "candidate_skills_candidate_id_is_primary_idx" ON "candidate_skills"("candidate_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_skills_candidate_id_skill_community_id_key" ON "candidate_skills"("candidate_id", "skill_community_id");

-- CreateIndex
CREATE INDEX "evaluations_organization_id_status_deleted_at_idx" ON "evaluations"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "evaluations_candidate_id_deleted_at_idx" ON "evaluations"("candidate_id", "deleted_at");

-- CreateIndex
CREATE INDEX "evaluations_client_id_deleted_at_idx" ON "evaluations"("client_id", "deleted_at");

-- CreateIndex
CREATE INDEX "evaluations_evaluator_id_idx" ON "evaluations"("evaluator_id");

-- CreateIndex
CREATE INDEX "evaluations_organization_id_evaluated_at_idx" ON "evaluations"("organization_id", "evaluated_at");

-- CreateIndex
CREATE INDEX "background_checks_organization_id_status_deleted_at_idx" ON "background_checks"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "background_checks_candidate_id_type_deleted_at_idx" ON "background_checks"("candidate_id", "type", "deleted_at");

-- CreateIndex
CREATE INDEX "background_checks_requested_by_id_idx" ON "background_checks"("requested_by_id");

-- CreateIndex
CREATE INDEX "background_checks_external_reference_id_idx" ON "background_checks"("external_reference_id");

-- CreateIndex
CREATE INDEX "background_checks_organization_id_completed_at_idx" ON "background_checks"("organization_id", "completed_at");

-- CreateIndex
CREATE INDEX "shortlists_organization_id_status_deleted_at_idx" ON "shortlists"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "shortlists_client_id_deleted_at_idx" ON "shortlists"("client_id", "deleted_at");

-- CreateIndex
CREATE INDEX "shortlists_created_by_id_idx" ON "shortlists"("created_by_id");

-- CreateIndex
CREATE INDEX "shortlists_organization_id_due_date_idx" ON "shortlists"("organization_id", "due_date");

-- CreateIndex
CREATE INDEX "shortlist_candidates_candidate_id_deleted_at_idx" ON "shortlist_candidates"("candidate_id", "deleted_at");

-- CreateIndex
CREATE INDEX "shortlist_candidates_shortlist_id_rank_idx" ON "shortlist_candidates"("shortlist_id", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "shortlist_candidates_shortlist_id_candidate_id_key" ON "shortlist_candidates"("shortlist_id", "candidate_id");

-- CreateIndex
CREATE INDEX "interview_requests_organization_id_status_deleted_at_idx" ON "interview_requests"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "interview_requests_candidate_id_scheduled_at_idx" ON "interview_requests"("candidate_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "interview_requests_client_id_status_deleted_at_idx" ON "interview_requests"("client_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "interview_requests_shortlist_id_idx" ON "interview_requests"("shortlist_id");

-- CreateIndex
CREATE INDEX "interview_requests_requested_by_id_idx" ON "interview_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "interview_requests_assigned_to_id_idx" ON "interview_requests"("assigned_to_id");

-- CreateIndex
CREATE INDEX "interview_requests_organization_id_scheduled_at_idx" ON "interview_requests"("organization_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "trial_requests_organization_id_status_deleted_at_idx" ON "trial_requests"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "trial_requests_candidate_id_deleted_at_idx" ON "trial_requests"("candidate_id", "deleted_at");

-- CreateIndex
CREATE INDEX "trial_requests_client_id_status_deleted_at_idx" ON "trial_requests"("client_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "trial_requests_deployment_id_idx" ON "trial_requests"("deployment_id");

-- CreateIndex
CREATE INDEX "trial_requests_requested_by_id_idx" ON "trial_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "trial_requests_organization_id_start_date_idx" ON "trial_requests"("organization_id", "start_date");

-- CreateIndex
CREATE INDEX "deployments_organization_id_status_deleted_at_idx" ON "deployments"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "deployments_candidate_id_deleted_at_idx" ON "deployments"("candidate_id", "deleted_at");

-- CreateIndex
CREATE INDEX "deployments_client_id_status_deleted_at_idx" ON "deployments"("client_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "deployments_created_by_id_idx" ON "deployments"("created_by_id");

-- CreateIndex
CREATE INDEX "deployments_organization_id_start_date_idx" ON "deployments"("organization_id", "start_date");

-- CreateIndex
CREATE INDEX "deployments_organization_id_end_date_idx" ON "deployments"("organization_id", "end_date");

-- CreateIndex
CREATE INDEX "documents_organization_id_entity_type_entity_id_deleted_at_idx" ON "documents"("organization_id", "entity_type", "entity_id", "deleted_at");

-- CreateIndex
CREATE INDEX "documents_organization_id_entity_type_entity_id_kind_delete_idx" ON "documents"("organization_id", "entity_type", "entity_id", "kind", "deleted_at");

-- CreateIndex
CREATE INDEX "documents_uploaded_by_id_idx" ON "documents"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "documents_organization_id_status_deleted_at_idx" ON "documents"("organization_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "documents_s3_key_idx" ON "documents"("s3_key");

-- CreateIndex
CREATE INDEX "notifications_user_id_status_deleted_at_idx" ON "notifications"("user_id", "status", "deleted_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_organization_id_type_created_at_idx" ON "notifications"("organization_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_channel_status_idx" ON "notifications"("user_id", "channel", "status");

-- CreateIndex
CREATE INDEX "audit_logs_organization_id_created_at_idx" ON "audit_logs"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_created_at_idx" ON "audit_logs"("actor_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_manager_id_fkey" FOREIGN KEY ("account_manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_communities" ADD CONSTRAINT "skill_communities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_primary_skill_community_id_fkey" FOREIGN KEY ("primary_skill_community_id") REFERENCES "skill_communities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_resume_document_id_fkey" FOREIGN KEY ("resume_document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_profile_image_document_id_fkey" FOREIGN KEY ("profile_image_document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_intro_video_document_id_fkey" FOREIGN KEY ("intro_video_document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_rejected_by_id_fkey" FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skill_community_id_fkey" FOREIGN KEY ("skill_community_id") REFERENCES "skill_communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_checks" ADD CONSTRAINT "background_checks_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlist_candidates" ADD CONSTRAINT "shortlist_candidates_shortlist_id_fkey" FOREIGN KEY ("shortlist_id") REFERENCES "shortlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlist_candidates" ADD CONSTRAINT "shortlist_candidates_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shortlist_candidates" ADD CONSTRAINT "shortlist_candidates_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_shortlist_id_fkey" FOREIGN KEY ("shortlist_id") REFERENCES "shortlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_requests" ADD CONSTRAINT "trial_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_requests" ADD CONSTRAINT "trial_requests_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_requests" ADD CONSTRAINT "trial_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_requests" ADD CONSTRAINT "trial_requests_deployment_id_fkey" FOREIGN KEY ("deployment_id") REFERENCES "deployments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_requests" ADD CONSTRAINT "trial_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
