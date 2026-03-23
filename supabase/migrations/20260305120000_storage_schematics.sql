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
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'schematic_uploads' 
        AND policyname = 'Public uploads metadata'
    ) THEN
        CREATE POLICY "Public uploads metadata" ON public.schematic_uploads FOR INSERT TO anon WITH CHECK (true);
    END IF;
END $$;

-- Allow authenticated reads
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'schematic_uploads' 
        AND policyname = 'Authenticated users can view uploads metadata'
    ) THEN
        CREATE POLICY "Authenticated users can view uploads metadata" ON public.schematic_uploads FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Ensure storage schema exists (standard in Supabase but good to be safe if running raw SQL)
-- usually extensions are already enabled.

-- Create storage bucket 'schematics'
INSERT INTO storage.buckets (id, name, public)
VALUES ('schematics', 'schematics', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the 'schematics' bucket

-- 1. Allow public uploads
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Schematic Uploads Public'
    ) THEN
        CREATE POLICY "Schematic Uploads Public" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'schematics');
    END IF;
END $$;

-- 2. Allow public reads (since bucket is public)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Schematic Reads Public'
    ) THEN
        CREATE POLICY "Schematic Reads Public" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'schematics');
    END IF;
END $$;

-- 3. Allow authenticated uploads/updates/deletes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Schematic Admin Access'
    ) THEN
        CREATE POLICY "Schematic Admin Access" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'schematics') WITH CHECK (bucket_id = 'schematics');
    END IF;
END $$;
