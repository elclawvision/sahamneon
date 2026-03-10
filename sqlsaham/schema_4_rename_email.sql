-- Migration to rename 'email' to 'user_email' in 'saham_clients'
-- This ensures consistency with the profiles table naming convention.

ALTER TABLE "public"."saham_clients" RENAME COLUMN "email" TO "user_email";
