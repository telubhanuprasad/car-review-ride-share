
import React, { useState } from 'react';
import { Car, BookingData } from '@/types/car';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface BookingModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ car, isOpen, onClose }) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    pickupDate: '',
    returnDate: '',
    customerName: currentUser?.displayName || '',
    customerEmail: currentUser?.email || '',
    customerPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !car) {
      toast({
        title: "Authentication Error",
        description: "Please login to continue with booking.",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation
    if (!formData.pickupDate || !formData.returnDate || !formData.customerName || !formData.customerEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Calculate total days and price
    const pickupDate = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      toast({
        title: "Invalid Dates",
        description: "Return date must be after pickup date.",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = days * car.price;

    setIsSubmitting(true);

    try {
      const bookingData: Omit<BookingData, 'id'> = {
        carId: car.id,
        carName: car.name,
        carImage: car.image,
        carPrice: car.price,
        pickupDate: formData.pickupDate,
        returnDate: formData.returnDate,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        userId: currentUser.uid,
        totalPrice,
        days,
        bookingDate: new Date().toISOString(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);

      toast({
        title: "Booking Confirmed!",
        description: `Your ${car.name} has been booked for ${days} days. Total: $${totalPrice}`,
      });

      onClose();
      setFormData({
        pickupDate: '',
        returnDate: '',
        customerName: currentUser?.displayName || '',
        customerEmail: currentUser?.email || '',
        customerPhone: '',
      });
      
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to save booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {car.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickupDate">Pickup Date</Label>
              <Input
                id="pickupDate"
                name="pickupDate"
                type="date"
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="returnDate">Return Date</Label>
              <Input
                id="returnDate"
                name="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={handleInputChange}
                min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="customerName">Full Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              name="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Daily Rate:</span>
              <span>${car.price}/day</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
