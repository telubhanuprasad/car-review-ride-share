import React, { useState, useEffect } from 'react';
import { Car, Review } from '@/types/car';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface ReviewModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ car, isOpen, onClose, onReviewSubmitted }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (car && isOpen) {
      loadReviews();
    }
  }, [car, isOpen]);

  const loadReviews = async () => {
    if (!car) return;
    
    setLoading(true);
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('carId', '==', car.id)
      );
      const querySnapshot = await getDocs(reviewsQuery);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        rating: doc.data().rating,
        comment: doc.data().comment,
        date: doc.data().date,
        userName: doc.data().userName,
        userId: doc.data().userId,
        bookingId: doc.data().bookingId,
      })) as Review[];
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reviews for {car.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Average Rating Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(Math.round(calculateAverageRating()))}</div>
              <span className="text-lg font-semibold">
                {calculateAverageRating().toFixed(1)} out of 5
              </span>
            </div>
            <p className="text-sm text-gray-600">Based on {reviews.length} verified bookings</p>
          </div>

          {/* Existing Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mt-1"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Verified Booking
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet.</p>
                <p className="text-sm text-gray-400 mt-1">Reviews can only be written after booking this car.</p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
