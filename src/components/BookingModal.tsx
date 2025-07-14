
import React, { useState, useEffect } from 'react';
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
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total days and price whenever dates change
  useEffect(() => {
    if (formData.pickupDate && formData.returnDate && car) {
      const pickupDate = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        setTotalDays(days);
        setTotalPrice(days * car.price);
      } else {
        setTotalDays(0);
        setTotalPrice(0);
      }
    } else {
      setTotalDays(0);
      setTotalPrice(0);
    }
  }, [formData.pickupDate, formData.returnDate, car]);

  const validatePhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

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

    // Phone number validation
    if (!formData.customerPhone || !validatePhoneNumber(formData.customerPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    // Date validation
    if (totalDays <= 0) {
      toast({
        title: "Invalid Dates",
        description: "Return date must be after pickup date.",
        variant: "destructive",
      });
      return;
    }

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
        days: totalDays,
        bookingDate: new Date().toISOString(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);

      toast({
        title: "Booking Confirmed!",
        description: `Your ${car.name} has been booked for ${totalDays} days. Total: $${totalPrice}`,
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
    const { name, value } = e.target;
    
    // For phone number, only allow digits and limit to 10
    if (name === 'customerPhone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setFormData({
          ...formData,
          [name]: digitsOnly,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
              placeholder="Enter 10-digit phone number"
              maxLength={10}
              required
            />
            {formData.customerPhone && !validatePhoneNumber(formData.customerPhone) && (
              <p className="text-sm text-red-500 mt-1">Phone number must be exactly 10 digits</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Daily Rate:</span>
              <span>${car.price}/day</span>
            </div>
            {totalDays > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Days:</span>
                  <span>{totalDays} days</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-bold text-lg">Total Price:</span>
                  <span className="font-bold text-lg text-green-600">${totalPrice}</span>
                </div>
              </>
            )}
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
