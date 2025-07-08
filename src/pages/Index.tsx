
import React, { useState, useEffect } from 'react';
import { Car } from '@/types/car';
import { carsData } from '@/data/cars';
import CarCard from '@/components/CarCard';
import BookingModal from '@/components/BookingModal';
import ReviewModal from '@/components/ReviewModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car as CarIcon, Search, Filter } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

const Index = () => {
  const [cars, setCars] = useState<Car[]>(carsData);
  const [filteredCars, setFilteredCars] = useState<Car[]>(carsData);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  useEffect(() => {
    loadCarsWithReviews();
  }, []);

  useEffect(() => {
    filterCars();
  }, [searchTerm, priceFilter, brandFilter, cars]);

  const loadCarsWithReviews = async () => {
    try {
      const updatedCars = await Promise.all(
        carsData.map(async (car) => {
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('carId', '==', car.id)
          );
          const querySnapshot = await getDocs(reviewsQuery);
          const reviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          const averageRating = reviews.length > 0
            ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
            : 0;
          
          return {
            ...car,
            reviews,
            averageRating
          };
        })
      );
      
      setCars(updatedCars);
    } catch (error) {
      console.error('Error loading cars with reviews:', error);
      setCars(carsData);
    }
  };

  const filterCars = () => {
    let filtered = cars;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(car =>
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(car => {
        switch (priceFilter) {
          case 'under75':
            return car.price < 75;
          case '75to150':
            return car.price >= 75 && car.price <= 150;
          case 'over150':
            return car.price > 150;
          default:
            return true;
        }
      });
    }

    // Brand filter
    if (brandFilter !== 'all') {
      filtered = filtered.filter(car => car.brand === brandFilter);
    }

    setFilteredCars(filtered);
  };

  const handleBookCar = (car: Car) => {
    setSelectedCar(car);
    setIsBookingModalOpen(true);
  };

  const handleViewReviews = (car: Car) => {
    setSelectedCar(car);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    loadCarsWithReviews();
  };

  const uniqueBrands = Array.from(new Set(cars.map(car => car.brand)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <CarIcon size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CarRent Pro</h1>
                <p className="text-gray-600">Premium Car Rental Service</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Find Your Perfect Car</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search cars..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under75">Under $75/day</SelectItem>
                <SelectItem value="75to150">$75 - $150/day</SelectItem>
                <SelectItem value="over150">Over $150/day</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map(car => (
            <CarCard
              key={car.id}
              car={car}
              onBook={handleBookCar}
              onViewReviews={handleViewReviews}
            />
          ))}
        </div>

        {filteredCars.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No cars found matching your criteria.
            </div>
            <p className="text-gray-400 mt-2">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <BookingModal
        car={selectedCar}
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedCar(null);
        }}
      />

      <ReviewModal
        car={selectedCar}
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedCar(null);
        }}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default Index;
