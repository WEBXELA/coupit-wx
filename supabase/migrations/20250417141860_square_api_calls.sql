/*
  # Create square_api_calls table

  1. New Tables
    - `square_api_calls`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `endpoint` (text)
      - `method` (text)
      - `status_code` (integer)
      - `created_at` (timestamp)
      - `environment` (text)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS square_api_calls (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  environment text NOT NULL
);

-- Enable RLS
ALTER TABLE square_api_calls ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own API calls"
  ON square_api_calls
  FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own API calls"
  ON square_api_calls
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- Create index for faster queries
CREATE INDEX idx_square_api_calls_profile_id ON square_api_calls(profile_id);
CREATE INDEX idx_square_api_calls_environment ON square_api_calls(environment); 