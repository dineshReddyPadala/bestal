-- Add Super Admin role for platform-wide administration
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
