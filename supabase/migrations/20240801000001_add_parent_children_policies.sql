-- Add policies for parents to manage their own children
DROP POLICY IF EXISTS "Parents can insert their own children" ON children;
CREATE POLICY "Parents can insert their own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

DROP POLICY IF EXISTS "Parents can update their own children" ON children;
CREATE POLICY "Parents can update their own children"
  ON children FOR UPDATE
  USING (auth.uid() = parent_id);
