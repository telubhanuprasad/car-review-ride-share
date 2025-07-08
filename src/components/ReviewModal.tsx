import React, { useState, useEffect } from 'react';
import { Car, Review } from '@/types/car';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface ReviewModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ car, isOpen, onClose, onReviewSubmitted }) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    userName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (car && isOpen) {
      loadReviews();
    }
  }, [car, isOpen]);

  const loadReviews = async () => {
    if (!car) return;
    
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('carId', '==', car.id)
      );
      const querySnapshot = await getDocs(reviewsQuery);
      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleRatingClick = (rating: number) => {
    setNewReview({ ...newReview, rating });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!car || !newReview.rating || !newReview.comment.trim() || !newReview.userName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select a rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add new review to Firestore
      const reviewData = {
        carId: car.id,
        rating: newReview.rating,
        comment: newReview.comment,
        userName: newReview.userName,
        date: new Date().toISOString(),
      };

      await addDoc(collection(db, 'reviews'), reviewData);

      // Reload reviews to get the updated list
      await loadReviews();

      // Calculate new average rating
      const allReviews = [...reviews, reviewData as Review];
      const averageRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;

      // Update car's average rating in Firestore (if you have a cars collection)
      // This is optional - you might want to calculate this on the fly
      
      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });

      setNewReview({ rating: 0, comment: '', userName: '' });
      onReviewSubmitted();
      
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onClick?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={20}
        className={`${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onClick && onClick(index + 1)}
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
            <p className="text-sm text-gray-600">Based on {reviews.length} reviews</p>
          </div>

          {/* Existing Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            )}
          </div>

          {/* Add New Review Form */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <Label>Your Name</Label>
                <Input
                  value={newReview.userName}
                  onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <Label>Rating</Label>
                <div className="flex gap-1 mt-1">
                  {renderStars(newReview.rating, true, handleRatingClick)}
                </div>
              </div>
              
              <div>
                <Label>Your Review</Label>
                <Textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Share your experience with this car..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
