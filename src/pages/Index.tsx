import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Car } from '@/types/car';
import { carsData } from '@/data/cars';
import CarCard from '@/components/CarCard';
import BookingModal from '@/components/BookingModal';
import ReviewModal from '@/components/ReviewModal';
import AdminUpload from '@/components/AdminUpload';
import AdminPanel from '@/components/AdminPanel';
import LoginPopup from '@/components/LoginPopup';
import SignUpPopup from '@/components/SignUpPopup';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import SearchFilters from '@/components/SearchFilters';
import CarsGrid from '@/components/CarsGrid';
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

  // Check if current user is admin
  const isAdmin = currentUser?.email === 'telubhanuprasad@gmail.com';

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
            userId: doc.data().userId || '',
            bookingId: doc.data().bookingId || '',
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

    // Always sort by price from low to high after applying filters
    filtered = filtered.sort((a, b) => a.price - b.price);

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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500 animate-pulse">
              ✨
            </div>
          </div>
          <p className="mt-6 text-lg text-slate-600 font-light">Loading your perfect car...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header 
        currentUser={currentUser}
        isAdmin={isAdmin}
        showAdminPanel={showAdminPanel}
        setShowAdminPanel={setShowAdminPanel}
        setIsLoginPopupOpen={setIsLoginPopupOpen}
        navigate={navigate}
      />

      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <div className="container mx-auto px-6 py-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg">
            <AdminPanel />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <HeroSection />

        <SearchFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          brandFilter={brandFilter}
          setBrandFilter={setBrandFilter}
          uniqueBrands={uniqueBrands}
        />

        <CarsGrid 
          filteredCars={filteredCars}
          loading={loading}
          onBookCar={handleBookCar}
          onViewReviews={handleViewReviews}
        />
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
