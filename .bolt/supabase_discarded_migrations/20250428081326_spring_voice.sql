/*
  # Add booking_id to advisor_reviews table

  1. Changes
    - Add `booking_id` column to `advisor_reviews` table
    - Add foreign key constraint to reference bookings table
    - Add unique constraint to prevent multiple reviews per booking
    - Add index for better query performance

  2. Security
    - No changes to RLS policies needed as existing policies cover the new column
*/

-- Add booking_id column
ALTER TABLE advisor_reviews 
ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE;

-- Add unique constraint to prevent multiple reviews per booking
ALTER TABLE advisor_reviews
ADD CONSTRAINT advisor_reviews_booking_id_key UNIQUE (booking_id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_advisor_reviews_booking_id ON advisor_reviews(booking_id);