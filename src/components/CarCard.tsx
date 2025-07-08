
import React from 'react';
import { Car } from '@/types/car';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, Fuel, Settings, Calendar } from 'lucide-react';

interface CarCardProps {
  car: Car;
  onBook: (car: Car) => void;
  onViewReviews: (car: Car) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onBook, onViewReviews }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
          <span className="text-lg font-bold text-primary">${car.price}/day</span>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl">{car.name}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(car.averageRating)}
          </div>
          <span className="text-sm text-gray-600">
            {car.averageRating.toFixed(1)} ({car.reviews.length} reviews)
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            <span>{car.seats} seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Settings size={16} />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Fuel size={16} />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{car.year}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Features:</h4>
          <div className="flex flex-wrap gap-1">
            {car.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {feature}
              </span>
            ))}
            {car.features.length > 3 && (
              <span className="text-xs text-gray-500">+{car.features.length - 3} more</span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => onBook(car)} className="flex-1">
            Book Now
          </Button>
          <Button variant="outline" onClick={() => onViewReviews(car)}>
            Reviews
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarCard;
