
-- Create quote_page_clicks table
CREATE TABLE public.quote_page_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer_url TEXT
);

ALTER TABLE public.quote_page_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert clicks" ON public.quote_page_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read clicks" ON public.quote_page_clicks FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create email_signups table
CREATE TABLE public.email_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert emails" ON public.email_signups FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can read emails" ON public.email_signups FOR SELECT USING (auth.uid() IS NOT NULL);
