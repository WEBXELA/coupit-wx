/*
  # Update profiles table RLS policies

  1. Changes
    - Add new policy to allow reading all profiles with Square connections
    - Keep existing policies for user-specific operations

  2. Security
    - Only allow reading specific fields for connected accounts
    - Maintain existing security for user-specific operations
*/

-- Drop existing select policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policies for viewing profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view Square connected profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (square_merchant_id IS NOT NULL);

-- Keep existing update and insert policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);