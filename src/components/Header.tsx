
import React from 'react';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Settings, LogIn, User } from 'lucide-react';

interface HeaderProps {
  currentUser: any;
  isAdmin: boolean;
  showAdminPanel: boolean;
  setShowAdminPanel: (show: boolean) => void;
  setIsLoginPopupOpen: (open: boolean) => void;
  navigate: (path: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  isAdmin,
  showAdminPanel,
  setShowAdminPanel,
  setIsLoginPopupOpen,
  navigate
}) => {
  return (
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
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="rounded-full border-slate-200 bg-white/50 hover:bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <Settings size={16} className="mr-2" />
                Admin
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
