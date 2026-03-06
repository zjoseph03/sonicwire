-- Fix RLS policies for orders table
-- Run this in the Supabase SQL Editor

-- 1. Drop existing policies to clear conflicts
DROP POLICY IF EXISTS "Public create orders" ON public.orders;
DROP POLICY IF EXISTS "Authenticated view orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

-- 2. Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. Create a permissive INSERT policy for EVERYONE (public role covers anon + authenticated)
CREATE POLICY "Anyone can insert orders" ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 4. Create a SELECT policy only for authenticated users (admins)
CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);
