import React, { useState, useEffect } from 'react';
import { BookingData } from '@/types/car';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Calendar, Car, Star, MessageSquare, Search, Filter } from 'lucide-react';
import BookingReviewModal from './BookingReviewModal';

const BookingHistory = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [carIdFilter, setCarIdFilter] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');

  useEffect(() => {
    if (currentUser) {
      console.log('Current user ID:', currentUser.uid);
      loadBookingHistory();
    } else {
      console.log('No current user found');
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [bookings, carIdFilter, reviewStatusFilter]);

  const loadBookingHistory = async () => {
    if (!currentUser) {
      console.log('No current user - cannot load bookings');
      return;
    }

    try {
      console.log('Loading bookings for user:', currentUser.uid);
      
      // First, let's get all bookings to see what's in the database
      const allBookingsQuery = query(collection(db, 'bookings'));
      const allBookingsSnapshot = await getDocs(allBookingsQuery);
      console.log('Total bookings in database:', allBookingsSnapshot.size);
      
      allBookingsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('Booking document:', doc.id, data);
      });

      // Now get bookings for the current user
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      console.log('User bookings found:', querySnapshot.size);
      
      const bookingsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing booking:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      }) as BookingData[];

      console.log('Processed bookings data:', bookingsData);

      // Sort by booking date (most recent first)
      bookingsData.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

      // Check which bookings have reviews
      const bookingsWithReviewStatus = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
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
          } catch (error) {
            console.error('Error checking reviews for booking:', booking.id, error);
            return {
              ...booking,
              hasReview: false
            };
          }
        })
      );

      console.log('Final bookings with review status:', bookingsWithReviewStatus);
      setBookings(bookingsWithReviewStatus);
    } catch (error) {
      console.error('Error loading booking history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = bookings;

    if (carIdFilter.trim()) {
      filtered = filtered.filter(booking => 
        booking.carId?.toLowerCase().includes(carIdFilter.toLowerCase()) ||
        booking.carName?.toLowerCase().includes(carIdFilter.toLowerCase())
      );
    }

    if (reviewStatusFilter !== 'all') {
      if (reviewStatusFilter === 'pending') {
        filtered = filtered.filter(booking => !booking.hasReview);
      } else if (reviewStatusFilter === 'reviewed') {
        filtered = filtered.filter(booking => booking.hasReview);
      }
    }

    setFilteredBookings(filtered);
    console.log('Filtered bookings:', filtered);
  };

  const clearFilters = () => {
    setCarIdFilter('');
    setReviewStatusFilter('all');
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
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking history...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Please log in</h3>
          <p className="text-gray-500">You need to be logged in to view your booking history.</p>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No bookings yet</h3>
          <p className="text-gray-500">Your booking history will appear here once you rent a car.</p>
          <Button 
            onClick={loadBookingHistory} 
            variant="outline" 
            className="mt-4"
          >
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Booking History</h2>
        <Badge variant="secondary">{bookings.length} total bookings</Badge>
        {filteredBookings.length !== bookings.length && (
          <Badge variant="outline">{filteredBookings.length} filtered</Badge>
        )}
        <Button 
          onClick={loadBookingHistory} 
          variant="outline" 
          size="sm"
          className="ml-auto"
        >
          Refresh
        </Button>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filter Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carId">Car ID / Car Name</Label>
              <Input
                id="carId"
                placeholder="Search by car ID or name"
                value={carIdFilter}
                onChange={(e) => setCarIdFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewStatus">Review Status</Label>
              <Select value={reviewStatusFilter} onValueChange={setReviewStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All bookings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All bookings</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
                disabled={!carIdFilter && reviewStatusFilter === 'all'}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table View */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={booking.carImage || '/placeholder.svg'}
                        alt={booking.carName || 'Car'}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      <div>
                        <p className="font-medium">{booking.carName || 'Unknown Car'}</p>
                        <p className="text-sm text-gray-600">${booking.carPrice || 0}/day</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Pick: {booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString() : 'N/A'}</p>
                      <p>Return: {booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-gray-600">{booking.days || 0} days</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <p className="font-semibold">${booking.totalPrice || 0}</p>
                      <p className="text-xs text-gray-600">
                        Booked: {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {booking.hasReview ? (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3" />
                        Reviewed
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending Review</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!booking.hasReview && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReviewClick(booking)}
                        className="gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredBookings.length === 0 && (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No bookings match your filters</p>
              <Button variant="link" onClick={clearFilters} className="mt-2">
                Clear filters to see all bookings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
