-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES users(id),
  child_id UUID REFERENCES children(id),
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT,
  payment_method TEXT,
  category TEXT,
  notes TEXT,
  transaction_id TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all payments (for development purposes)
CREATE POLICY "Authenticated users can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert payments
CREATE POLICY "Authenticated users can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update their own payments
CREATE POLICY "Authenticated users can update their own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON payments TO anon, authenticated;
