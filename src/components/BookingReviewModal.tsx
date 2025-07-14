
import React, { useState } from 'react';
import { BookingData } from '@/types/car';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface BookingReviewModalProps {
  booking: BookingData | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

const BookingReviewModal: React.FC<BookingReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onReviewSubmitted
}) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking || !currentUser || !rating || !comment.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both rating and comment.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        carId: booking.carId,
        bookingId: booking.id,
        userId: currentUser.uid,
        rating: rating,
        comment: comment.trim(),
        userName: currentUser.displayName || booking.customerName,
        date: new Date().toISOString()
      };

      await addDoc(collection(db, 'reviews'), reviewData);

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback.",
      });

      setRating(0);
      setComment('');
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

  const renderStars = (currentRating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={24}
        className={`cursor-pointer transition-colors ${
          index < currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
        }`}
        onClick={() => handleRatingClick(index + 1)}
      />
    ));
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Your Experience</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={booking.carImage}
              alt={booking.carName}
              className="w-12 h-12 object-cover rounded"
            />
            <div>
              <h3 className="font-medium">{booking.carName}</h3>
              <p className="text-sm text-gray-600">
                {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Your Rating</Label>
              <div className="flex gap-1 mt-2">
                {renderStars(rating)}
              </div>
            </div>
            
            <div>
              <Label htmlFor="comment" className="text-sm font-medium">Your Review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this car..."
                rows={4}
                className="mt-1"
                required
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !rating || !comment.trim()} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingReviewModal;
