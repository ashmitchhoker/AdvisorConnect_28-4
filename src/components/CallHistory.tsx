import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Star,
  ExternalLink,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  scheduled_at: string;
  status: 'completed' | 'cancelled' | 'rescheduled' | 'booked';
  rating: number | null;
  advisor: {
    id: string;
    full_name: string;
    profile_pic: string;
  };
  package: {
    title: string;
    duration: number;
  };
}

export function CallHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(
    null
  );
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    async function fetchBookings() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(
            `
            id,
            scheduled_at,
            status,
            rating,
            advisor_id,
            advisor:advisor_profiles!bookings_advisor_id_fkey(
              advisor_id,
              full_name,
              profile_pic
            ),
            package:advisor_packages!inner(
              title,
              duration
            )
          `
          )
          .eq('customer_id', session.user.id)
          .lt('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: false });

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
          return;
        }

        // Transform the data to match our interface
        const transformedBookings =
          bookingsData?.map((booking) => ({
            id: booking.id,
            scheduled_at: booking.scheduled_at,
            status: booking.status as Booking['status'],
            rating: booking.rating,
            advisor: {
              id: booking.advisor?.advisor_id || '',
              full_name: booking.advisor?.full_name || 'Unknown Advisor',
              profile_pic: booking.advisor?.profile_pic || '',
            },
            package: {
              title: booking.package?.title || '',
              duration: booking.package?.duration || 0,
            },
          })) || [];

        setBookings(transformedBookings);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handleSubmitRating = async (bookingId: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ rating })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(
        bookings.map((b) => {
          if (b.id === bookingId) {
            return { ...b, rating };
          }
          return b;
        })
      );

      setReviewingBookingId(null);
      setRating(0);
      setHoveredRating(0);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleEditRating = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking && booking.rating) {
      setRating(booking.rating);
      setReviewingBookingId(bookingId);
    }
  };

  // New function to handle initial star selection
  const handleInitialStarClick = (bookingId: string, initialRating: number) => {
    setRating(initialRating);
    setReviewingBookingId(bookingId);
  };

  const getStatusDetails = (status: Booking['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Completed',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Cancelled',
        };
      case 'rescheduled':
        return {
          icon: Clock,
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          label: 'Rescheduled',
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Incomplete',
        };
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200"></div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No call history available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => {
        const statusDetails = getStatusDetails(booking.status);
        const StatusIcon = statusDetails.icon;

        return (
          <div
            key={booking.id}
            className={`rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg ${
              booking.status === 'completed'
                ? 'border-l-4 border-green-500'
                : booking.status === 'cancelled'
                ? 'border-l-4 border-red-500'
                : booking.status === 'rescheduled'
                ? 'border-l-4 border-orange-500'
                : 'border-l-4 border-yellow-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={
                    booking.advisor.profile_pic ||
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                  }
                  alt={booking.advisor.full_name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
                  }}
                />
                <div>
                  <h3 className="font-medium text-lg">
                    {booking.advisor.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {booking.package.title}
                  </p>
                  <div className="mt-2 flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium ${statusDetails.bgColor} ${statusDetails.textColor}`}
                    >
                      <StatusIcon className="h-4 w-4" />
                      <span>{statusDetails.label}</span>
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.scheduled_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.scheduled_at), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {booking.status === 'completed' && (
              <div className="mt-4 border-t pt-4">
                {!booking.rating && reviewingBookingId !== booking.id ? (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            handleInitialStarClick(booking.id, star)
                          }
                          className="focus:outline-none transition-colors"
                        >
                          <Star
                            className="h-5 w-5 text-gray-300 hover:text-yellow-400"
                            fill="none"
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-blue-600 hover:text-blue-700">
                      Rate this session
                    </span>
                  </div>
                ) : reviewingBookingId === booking.id ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="focus:outline-none transition-colors"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              (
                                hoveredRating > 0
                                  ? star <= hoveredRating
                                  : star <= rating
                              )
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill={
                              (
                                hoveredRating > 0
                                  ? star <= hoveredRating
                                  : star <= rating
                              )
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setReviewingBookingId(null);
                          setRating(0);
                          setHoveredRating(0);
                        }}
                        className="rounded-lg px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitRating(booking.id)}
                        disabled={!rating}
                        className="rounded-lg bg-blue-800 px-4 py-2 text-white hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Rating
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-5 w-5 text-yellow-400"
                            fill={
                              star <= booking.rating! ? 'currentColor' : 'none'
                            }
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => handleEditRating(booking.id)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Edit
                      </button>
                    </div>
                    <Link
                      to={`/advisor/${booking.advisor.id}`}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <span>View Advisor Profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
