/*
  # Create advisor availability table and add sample data

  1. New Tables
    - `advisor_availability`
      - `id` (uuid, primary key)
      - `advisor_id` (uuid, foreign key to advisors)
      - `day_of_week` (integer, 0-6 where 0 is Sunday)
      - `start_time` (time)
      - `end_time` (time)
      - `is_available` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policy for public read access
    - Add policy for advisors to manage their availability

  3. Sample Data
    - Different time slots for each advisor
    - Some days marked as unavailable
    - Varied schedules across weekdays and weekends
*/

-- Create advisor availability table
CREATE TABLE IF NOT EXISTS advisor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid REFERENCES advisors(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL CHECK (end_time > start_time),
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(advisor_id, day_of_week, start_time)
);

-- Enable Row Level Security
ALTER TABLE advisor_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read advisor availability"
  ON advisor_availability
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM advisors
      WHERE advisors.id = advisor_availability.advisor_id
      AND advisors.is_verified = true
    )
  );

CREATE POLICY "Advisors can manage own availability"
  ON advisor_availability
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM advisors
      WHERE advisors.id = advisor_availability.advisor_id
      AND advisors.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_advisor_availability_updated_at
  BEFORE UPDATE ON advisor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_advisor_availability_advisor_id ON advisor_availability(advisor_id);
CREATE INDEX IF NOT EXISTS idx_advisor_availability_day_time ON advisor_availability(advisor_id, day_of_week, start_time);

-- Insert sample availability data for SEBI analysts
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id as advisor_id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '09:00:00'::time as start_time,
  '17:00:00'::time as end_time,
  true as is_available
FROM advisors
WHERE registration_type = 'SEBI';

-- Add some evening slots for SEBI analysts
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id as advisor_id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '18:00:00'::time as start_time,
  '20:00:00'::time as end_time,
  CASE WHEN random() > 0.3 THEN true ELSE false END as is_available
FROM advisors
WHERE registration_type = 'SEBI';

-- Add weekend availability for some SEBI analysts
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id as advisor_id,
  day_of_week,
  '10:00:00'::time as start_time,
  '15:00:00'::time as end_time,
  CASE WHEN random() > 0.5 THEN true ELSE false END as is_available
FROM advisors
CROSS JOIN (VALUES (0), (6)) as d(day_of_week) -- Sunday and Saturday
WHERE registration_type = 'SEBI';

-- Insert sample availability data for MFD distributors
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id as advisor_id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '10:00:00'::time as start_time,
  '18:00:00'::time as end_time,
  true as is_available
FROM advisors
WHERE registration_type = 'MFD';

-- Add some morning slots for MFD distributors
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id as advisor_id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '08:00:00'::time as start_time,
  '09:30:00'::time as end_time,
  CASE WHEN random() > 0.4 THEN true ELSE false END as is_available
FROM advisors
WHERE registration_type = 'MFD';

-- Add weekend availability for some MFD distributors
INSERT INTO advisor_availability (advisor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  id as advisor_id,
  day_of_week,
  '11:00:00'::time as start_time,
  '16:00:00'::time as end_time,
  CASE WHEN random() > 0.6 THEN true ELSE false END as is_available
FROM advisors
CROSS JOIN (VALUES (0), (6)) as d(day_of_week) -- Sunday and Saturday
WHERE registration_type = 'MFD';

-- Mark some weekdays as unavailable randomly
UPDATE advisor_availability
SET is_available = false
WHERE random() < 0.2; -- 20% chance of being unavailable