-- Add a function to debug payments in the database
CREATE OR REPLACE FUNCTION debug_payments()
RETURNS TABLE (
  payment_id UUID,
  parent_id UUID,
  parent_name TEXT,
  child_id UUID,
  child_name TEXT,
  amount DECIMAL(10, 2),
  date DATE,
  status TEXT,
  payment_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as payment_id,
    p.parent_id,
    CONCAT(u.first_name, ' ', u.last_name) as parent_name,
    p.child_id,
    CASE 
      WHEN c.id IS NOT NULL THEN CONCAT(c.first_name, ' ', c.last_name)
      ELSE 'General Payment'
    END as child_name,
    p.amount,
    p.date,
    p.status,
    p.payment_type
  FROM payments p
  LEFT JOIN users u ON p.parent_id = u.id
  LEFT JOIN children c ON p.child_id = c.id
  ORDER BY p.date DESC;
END;
$$ LANGUAGE plpgsql;
