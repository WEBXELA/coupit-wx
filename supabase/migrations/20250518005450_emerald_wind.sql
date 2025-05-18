/*
  # Add square_connected_at column to profiles table

  1. Changes
    - Add square_connected_at timestamp column to profiles table
    - Set default value to null
    - Allow updating the column through existing RLS policies

  2. Security
    - No additional security changes needed
    - Existing RLS policies will handle access control
*/

-- Add square_connected_at column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'square_connected_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN square_connected_at timestamptz;
  END IF;
END $$;