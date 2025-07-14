
export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
  features: string[];
  transmission: string;
  fuelType: string;
  seats: number;
  reviews: Review[];
  averageRating: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
  userName: string;
  userId: string;
  bookingId: string;
}

export interface BookingData {
  id?: string;
  carId: string;
  carName: string;
  carImage: string;
  carPrice: number;
  pickupDate: string;
  returnDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  userId: string;
  totalPrice: number;
  days: number;
  bookingDate: string;
  hasReview?: boolean;
}
