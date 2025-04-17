/*
  # Create profiles table for user data

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `utm_source` (text)
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

/*
  # Create connected_sellers table for storing connected sellers' data

  1. New Tables
    - `connected_sellers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `seller_id` (text)
      - `seller_name` (text)
      - `connected_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS connected_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  seller_id text NOT NULL,
  seller_name text NOT NULL,
  connected_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE connected_sellers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own connected sellers" 
  ON connected_sellers 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connected sellers" 
  ON connected_sellers 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);
