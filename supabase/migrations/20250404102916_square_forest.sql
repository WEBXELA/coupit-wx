/*
  # Create profiles table for user data

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `utm_source` (text)
      - `square_access_token` (text)
      - `square_refresh_token` (text)
      - `square_token_expires_at` (timestamp)
      - `square_merchant_id` (text)
      - `square_environment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  utm_source text,
  square_access_token text,
  square_refresh_token text,
  square_token_expires_at timestamptz,
  square_merchant_id text,
  square_environment text DEFAULT 'production',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);