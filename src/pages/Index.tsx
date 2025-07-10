import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Car } from '@/types/car';
import { carsData } from '@/data/cars';
import CarCard from '@/components/CarCard';
import BookingModal from '@/components/BookingModal';
import ReviewModal from '@/components/ReviewModal';
import AdminUpload from '@/components/AdminUpload';
import LoginPopup from '@/components/LoginPopup';
import SignUpPopup from '@/components/SignUpPopup';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Search, Filter, Settings, Sparkles, LogIn, User } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isSignUpPopupOpen, setIsSignUpPopupOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    loadCarsData();
  }, []);

  useEffect(() => {
    filterCars();
  }, [searchTerm, priceFilter, brandFilter, cars]);

  // Show login/signup popup based on URL params or after 5 seconds if not logged in
  useEffect(() => {
    const showLoginParam = searchParams.get('showLogin');
    const showSignupParam = searchParams.get('showSignup');
    
    if (showLoginParam === 'true') {
      setIsLoginPopupOpen(true);
      setSearchParams({});
      return;
    }

    if (showSignupParam === 'true') {
      setIsSignUpPopupOpen(true);
      setSearchParams({});
      return;
    }

    if (!currentUser && !loading) {
      const timer = setTimeout(() => {
        setIsLoginPopupOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentUser, loading, searchParams, setSearchParams]);

  const loadCarsData = async () => {
    try {
      console.log('Loading cars data from Firebase...');
      
      // First, try to load cars from Firebase
      const carsCollection = collection(db, 'cars');
      const carsSnapshot = await getDocs(carsCollection);
      
      let carsFromFirebase: Car[] = [];
      
      if (!carsSnapshot.empty) {
        console.log('Found cars in Firebase, loading...');
        carsFromFirebase = carsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Car[];
      } else {
        console.log('No cars found in Firebase, using local data');
        carsFromFirebase = carsData;
      }

      // Load reviews for each car
      const updatedCars = await Promise.all(
        carsFromFirebase.map(async (car) => {
          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('carId', '==', car.id)
          );
          const querySnapshot = await getDocs(reviewsQuery);
          const reviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            rating: doc.data().rating,
            comment: doc.data().comment,
            date: doc.data().date,
            userName: doc.data().userName,
          }));
          
          const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
          
          return {
            ...car,
            reviews,
            averageRating
          };
        })
      );
      
      setCars(updatedCars);
      console.log('Cars loaded successfully:', updatedCars.length);
    } catch (error) {
      console.error('Error loading cars:', error);
      // Fallback to local data if Firebase fails
      setCars(carsData);
    } finally {
      setLoading(false);
    }
  };

  const filterCars = () => {
    let filtered = cars;

    if (searchTerm) {
      filtered = filtered.filter(car =>
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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

    if (brandFilter !== 'all') {
      filtered = filtered.filter(car => car.brand === brandFilter);
    }

    setFilteredCars(filtered);
  };

  const handleBookCar = (car: Car) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to continue with the purchase",
        variant: "destructive",
      });
      setIsLoginPopupOpen(true);
      return;
    }
    setSelectedCar(car);
    setIsBookingModalOpen(true);
  };

  const handleViewReviews = (car: Car) => {
    setSelectedCar(car);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    loadCarsData();
  };

  const handleSwitchToSignUp = () => {
    setIsLoginPopupOpen(false);
    setIsSignUpPopupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignUpPopupOpen(false);
    setIsLoginPopupOpen(true);
  };

  const uniqueBrands = Array.from(new Set(cars.map(car => car.brand)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <p className="mt-6 text-lg text-slate-600 font-light">Loading your perfect car...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <CarIcon size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  CarRent Pro
                </h1>
                <p className="text-slate-500 font-light">Premium Car Rental Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="rounded-full border-slate-200 bg-white/50 hover:bg-white/80 backdrop-blur-sm transition-all duration-200"
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLoginPopupOpen(true)}
                  className="rounded-full border-slate-200 bg-white/50 hover:bg-white/80 backdrop-blur-sm transition-all duration-200"
                >
                  <LogIn size={16} className="mr-2" />
                  Login
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="rounded-full border-slate-200 bg-white/50 hover:bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <Settings size={16} className="mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-2 shadow-lg">
              <AdminUpload />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100/60 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles size={16} />
            Premium Car Collection
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
            Find Your Perfect
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Drive</span>
          </h2>
          <p className="text-xl text-slate-600 font-light max-w-2xl mx-auto">
            Discover our curated collection of premium vehicles, tailored for every journey and occasion.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
              <Filter size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Find Your Ideal Car</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search by car, brand, or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              />
            </div>
            
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 bg-white/95 backdrop-blur-sm">
                <SelectItem value="all" className="rounded-xl">All Prices</SelectItem>
                <SelectItem value="under75" className="rounded-xl">Under $75/day</SelectItem>
                <SelectItem value="75to150" className="rounded-xl">$75 - $150/day</SelectItem>
                <SelectItem value="over150" className="rounded-xl">Over $150/day</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all duration-200">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 bg-white/95 backdrop-blur-sm">
                <SelectItem value="all" className="rounded-xl">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand} className="rounded-xl">{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map(car => (
            <div key={car.id} className="transform hover:scale-105 transition-all duration-300">
              <CarCard
                car={car}
                onBook={handleBookCar}
                onViewReviews={handleViewReviews}
              />
            </div>
          ))}
        </div>

        {filteredCars.length === 0 && !loading && (
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

      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={() => setIsLoginPopupOpen(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      <SignUpPopup
        isOpen={isSignUpPopupOpen}
        onClose={() => setIsSignUpPopupOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default Index;
