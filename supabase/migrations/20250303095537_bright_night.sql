/*
  # Create health logs table

  1. New Tables
    - `health_logs`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references profiles)
      - `date` (date)
      - `water_intake` (integer)
      - `sleep_hours` (numeric)
      - `exercise_minutes` (integer)
      - `mood` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `health_logs` table
    - Add policies for students to manage their own logs
    - Add policies for parents to view their children's logs
*/

CREATE TABLE IF NOT EXISTS health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) NOT NULL,
  date date NOT NULL,
  water_intake integer DEFAULT 0,
  sleep_hours numeric(3,1) DEFAULT 0,
  exercise_minutes integer DEFAULT 0,
  mood text CHECK (mood IN ('happy', 'neutral', 'sad')),
  created_at timestamptz DEFAULT now()
);

-- Create unique constraint to prevent duplicate logs for the same day
ALTER TABLE health_logs ADD CONSTRAINT unique_student_date UNIQUE (student_id, date);

-- Enable Row Level Security
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view their own health logs"
  ON health_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY