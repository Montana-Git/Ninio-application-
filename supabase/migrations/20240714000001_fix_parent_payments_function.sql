-- Fix the get_parent_payments function to ensure it retrieves all payments for a parent
-- First drop the existing function
DROP FUNCTION IF EXISTS get_parent_payments(UUID);

-- Then create the updated function with debugging
CREATE FUNCTION get_parent_payments(parent_id UUID)
RETURNS TABLE (
  payment_id UUID,
  child_id UUID,
  child_name TEXT,
  amount DECIMAL(10, 2),
  date DATE,
  due_date DATE,
  status TEXT,
  payment_type TEXT,
  payment_method TEXT,
  category TEXT,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  parent_id UUID -- Added parent_id to the return for debugging
) AS $$
BEGIN
  -- Log the parent_id for debugging
  RAISE NOTICE 'Fetching payments for parent_id: %', parent_id;
  
  RETURN QUERY
  SELECT 
    p.id as payment_id,
    p.child_id,
    CASE 
      WHEN c.id IS NOT NULL THEN CONCAT(c.first_name, ' ', c.last_name)
      ELSE 'General Payment'
    END as child_name,
    p.amount,
    p.date,
    p.due_date,
    p.status,
    p.payment_type,
    p.payment_method,
    p.category,
    p.notes,
    p.receipt_url,
    p.created_at,
    p.parent_id -- Return the parent_id for verification
  FROM payments p
  LEFT JOIN children c ON p.child_id = c.id
  WHERE p.parent_id = get_parent_payments.parent_id
  ORDER BY p.date DESC;
END;
$$ LANGUAGE plpgsql;
