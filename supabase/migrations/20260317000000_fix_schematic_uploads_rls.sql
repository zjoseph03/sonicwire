-- Fix RLS policies for schematic_uploads table to allow authenticated users (like admins testing) to insert records.

-- 1. Drop the restrictive "anon only" policy
DROP POLICY IF EXISTS "Public uploads metadata" ON public.schematic_uploads;
-- Drop if exists to avoid conflict
DROP POLICY IF EXISTS "Anyone can upload metadata" ON public.schematic_uploads;

-- 2. Create a permissive INSERT policy for EVERYONE (public role covers both anon and authenticated)
CREATE POLICY "Anyone can upload metadata" ON public.schematic_uploads
  FOR INSERT
  TO public
  WITH CHECK (true);
