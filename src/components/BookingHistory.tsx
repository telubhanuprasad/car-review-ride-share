
import React, { useState, useEffect } from 'react';
import { BookingData } from '@/types/car';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [emailFilter, setEmailFilter] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadBookingHistory();
    }
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [bookings, carIdFilter, emailFilter]);

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

      console.log('Loaded bookings:', bookingsData);

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

  const applyFilters = () => {
    let filtered = bookings;

    if (carIdFilter.trim()) {
      filtered = filtered.filter(booking => 
        booking.carId.toLowerCase().includes(carIdFilter.toLowerCase()) ||
        booking.carName.toLowerCase().includes(carIdFilter.toLowerCase())
      );
    }

    if (emailFilter.trim()) {
      filtered = filtered.filter(booking => 
        booking.customerEmail.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
    console.log('Filtered bookings:', filtered);
  };

  const clearFilters = () => {
    setCarIdFilter('');
    setEmailFilter('');
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
        <Badge variant="secondary">{bookings.length} total bookings</Badge>
        {filteredBookings.length !== bookings.length && (
          <Badge variant="outline">{filteredBookings.length} filtered</Badge>
        )}
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
              <Label htmlFor="email">Customer Email</Label>
              <Input
                id="email"
                placeholder="Search by email"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
                disabled={!carIdFilter && !emailFilter}
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
                <TableHead>Car ID</TableHead>
                <TableHead>Customer Email</TableHead>
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
                        src={booking.carImage}
                        alt={booking.carName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium">{booking.carName}</p>
                        <p className="text-sm text-gray-600">${booking.carPrice}/day</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {booking.carId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{booking.customerEmail}</p>
                      <p className="text-xs text-gray-600">{booking.customerName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>Pick: {new Date(booking.pickupDate).toLocaleDateString()}</p>
                      <p>Return: {new Date(booking.returnDate).toLocaleDateString()}</p>
                      <p className="text-gray-600">{booking.days} days</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-right">
                      <p className="font-semibold">${booking.totalPrice}</p>
                      <p className="text-xs text-gray-600">
                        Booked: {new Date(booking.bookingDate).toLocaleDateString()}
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
