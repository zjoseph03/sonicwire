-- Allow authenticated users (admins) to update orders
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
