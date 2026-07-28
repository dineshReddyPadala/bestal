-- Add PENDING_APPROVAL to CandidateProfileStatus
ALTER TYPE "CandidateProfileStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
