
-- Create quote_page_clicks table
CREATE TABLE IF NOT EXISTS public.quote_page_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer_url TEXT
);

ALTER TABLE public.quote_page_clicks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'quote_page_clicks' 
        AND policyname = 'Anyone can insert clicks'
    ) THEN
        CREATE POLICY "Anyone can insert clicks" ON public.quote_page_clicks FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'quote_page_clicks' 
        AND policyname = 'Authenticated users can read clicks'
    ) THEN
        CREATE POLICY "Authenticated users can read clicks" ON public.quote_page_clicks FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Create email_signups table
CREATE TABLE IF NOT EXISTS public.email_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'email_signups' 
        AND policyname = 'Anyone can insert emails'
    ) THEN
        CREATE POLICY "Anyone can insert emails" ON public.email_signups FOR INSERT WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'email_signups' 
        AND policyname = 'Authenticated users can read emails'
    ) THEN
        CREATE POLICY "Authenticated users can read emails" ON public.email_signups FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

