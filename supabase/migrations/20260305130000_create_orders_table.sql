
-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  file_name TEXT,
  storage_path TEXT, -- Reference to the file in storage
  total_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  quantity INTEGER DEFAULT 1,
  total_length_cm NUMERIC,
  wire_count INTEGER,
  wire_data JSONB, -- The full JSON of parsed wires
  status TEXT DEFAULT 'pending' -- pending, paid, processing, completed
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public to create orders
CREATE POLICY "Public create orders" ON public.orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users (admins) to view all orders
CREATE POLICY "Authenticated view orders" ON public.orders
  FOR SELECT
  TO authenticated
  USING (true);
