
import React, { useState, useEffect } from 'react';
import { BookingData } from '@/types/car';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Calendar, Car, Star, MessageSquare } from 'lucide-react';
import BookingReviewModal from './BookingReviewModal';

const BookingHistory = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadBookingHistory();
    }
  }, [currentUser]);

  const loadBookingHistory = async () => {
    if (!currentUser) return;

    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', currentUser.uid),
        orderBy('bookingDate', 'desc')
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      const bookingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BookingData[];

      // Check which bookings have reviews
      const bookingsWithReviewStatus = await Promise.all(
        bookingsData.map(async (booking) => {
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('bookingId', '==', booking.id),
            where('userId', '==', currentUser.uid)
          );
          const reviewSnapshot = await getDocs(reviewsQuery);
          return {
            ...booking,
            hasReview: !reviewSnapshot.empty
          };
        })
      );

      setBookings(bookingsWithReviewStatus);
    } catch (error) {
      console.error('Error loading booking history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    loadBookingHistory();
    setIsReviewModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookings yet</h3>
          <p className="text-gray-500">Your booking history will appear here once you rent a car.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Booking History</h2>
        <Badge variant="secondary">{bookings.length} bookings</Badge>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <img
                  src={booking.carImage}
                  alt={booking.carName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{booking.carName}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">${booking.totalPrice}</p>
                      <p className="text-sm text-gray-600">{booking.days} days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Booked: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                      <span>${booking.carPrice}/day</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {booking.hasReview ? (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          Reviewed
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReviewClick(booking)}
                          className="gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Write Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <BookingReviewModal
        booking={selectedBooking}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedBooking(null);
        }}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default BookingHistory;
