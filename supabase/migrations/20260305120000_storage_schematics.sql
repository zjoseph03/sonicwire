-- Create table for tracking uploads metadata
CREATE TABLE IF NOT EXISTS public.schematic_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.schematic_uploads ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
CREATE POLICY "Public uploads metadata" ON public.schematic_uploads
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Allow authenticated reads
CREATE POLICY "Authenticated users can view uploads metadata" ON public.schematic_uploads
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure storage schema exists (standard in Supabase but good to be safe if running raw SQL)
-- usually extensions are already enabled.

-- Create storage bucket 'schematics'
INSERT INTO storage.buckets (id, name, public)
VALUES ('schematics', 'schematics', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the 'schematics' bucket

-- 1. Allow public uploads
CREATE POLICY "Schematic Uploads Public" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'schematics');

-- 2. Allow public reads (since bucket is public)
CREATE POLICY "Schematic Reads Public" ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'schematics');

-- 3. Allow authenticated uploads/updates/deletes
CREATE POLICY "Schematic Admin Access" ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'schematics')
  WITH CHECK (bucket_id = 'schematics');
