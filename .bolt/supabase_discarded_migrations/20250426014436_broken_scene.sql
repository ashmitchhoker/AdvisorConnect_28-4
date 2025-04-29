/*
  # Add rating to bookings table

  1. Changes
    - Add rating column to bookings table
    - Add trigger to sync ratings between bookings and advisor_reviews
    - Add function to handle rating updates

  2. Security
    - Maintain existing RLS policies
*/

-- Add rating column to bookings table
ALTER TABLE bookings
ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5);

-- Create function to sync ratings
CREATE OR REPLACE FUNCTION sync_booking_review() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update booking rating when a review is created
    UPDATE bookings
    SET rating = NEW.rating
    WHERE advisor_id = NEW.advisor_id
    AND customer_id = NEW.customer_id
    AND status = 'completed';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update booking rating when a review is updated
    UPDATE bookings
    SET rating = NEW.rating
    WHERE advisor_id = NEW.advisor_id
    AND customer_id = NEW.customer_id
    AND status = 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for advisor_reviews
CREATE TRIGGER sync_booking_review_trigger
AFTER INSERT OR UPDATE ON advisor_reviews
FOR EACH ROW
EXECUTE FUNCTION sync_booking_review();