-- Create quote_requests table to store user email submissions and quote data
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  file_name TEXT,
  production_time TEXT,
  shipping_time TEXT,
  total_time TEXT,
  complexity TEXT,
  confidence TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for the quote form)
CREATE POLICY "Allow public inserts" ON quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all data
CREATE POLICY "Allow authenticated reads" ON quote_requests
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on email for faster queries
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);

-- Add comment to table
COMMENT ON TABLE quote_requests IS 'Stores quote request submissions from users including their email and estimated production timeline';
