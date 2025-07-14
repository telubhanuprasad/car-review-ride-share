
import React from 'react';
import { Car } from '@/types/car';
import CarCard from '@/components/CarCard';
import { Search } from 'lucide-react';

interface CarsGridProps {
  filteredCars: Car[];
  loading: boolean;
  onBookCar: (car: Car) => void;
  onViewReviews: (car: Car) => void;
}

const CarsGrid: React.FC<CarsGridProps> = ({
  filteredCars,
  loading,
  onBookCar,
  onViewReviews
}) => {
  if (filteredCars.length === 0 && !loading) {
    return (
      <div className="text-center py-20">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto">
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Search className="text-slate-500" size={24} />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No cars found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search criteria or filters to find more options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredCars.map(car => (
        <div key={car.id} className="transform hover:scale-105 transition-all duration-300">
          <CarCard
            car={car}
            onBook={onBookCar}
            onViewReviews={onViewReviews}
          />
        </div>
      ))}
    </div>
  );
};

export default CarsGrid;
