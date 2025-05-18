/*
  # Update profiles RLS policies to allow multiple accounts

  1. Changes
    - Add new policy to allow inserting profiles for authenticated users
    - Modify existing policies to handle multiple profiles per user
    - Add user_id column to link profiles to users

  2. Security
    - Maintain secure access control
    - Allow users to have multiple Square connections
*/

-- Add user_id column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Update existing profiles to set user_id
UPDATE profiles SET user_id = id WHERE user_id IS NULL;

-- Make user_id NOT NULL after updating existing data
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view Square connected profiles" ON profiles;

-- Create new policies
CREATE POLICY "Users can view own profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view Square connected profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (square_merchant_id IS NOT NULL);