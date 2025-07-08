
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, LogOut, ArrowLeft, Settings, Shield, Calendar, Car } from 'lucide-react';
import Header from '@/components/Header';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const userInfo = [
    {
      icon: Mail,
      label: "Email",
      value: currentUser.email || 'Not provided',
      verified: currentUser.emailVerified
    },
    {
      icon: Phone,
      label: "Phone Number",
      value: currentUser.phoneNumber || 'Not provided',
      verified: !!currentUser.phoneNumber
    },
    {
      icon: Calendar,
      label: "Member Since",
      value: currentUser.metadata.creationTime 
        ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
        : 'Unknown'
    },
    {
      icon: Shield,
      label: "User ID",
      value: currentUser.uid,
      truncate: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="md:col-span-2 space-y-6">
              <Card className="glass-effect border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-muted-foreground">{info.label}</p>
                          {info.verified !== undefined && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              info.verified 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400'
                            }`}>
                              {info.verified ? 'Verified' : 'Unverified'}
                            </span>
                          )}
                        </div>
                        <p className={`font-medium ${info.truncate ? 'text-xs break-all' : ''}`}>
                          {info.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="glass-effect border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => navigate('/')}
                  >
                    <Car className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Browse Cars</div>
                      <div className="text-xs text-muted-foreground">Explore our fleet</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Booking history will be available soon!",
                      });
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">My Bookings</div>
                      <div className="text-xs text-muted-foreground">View rental history</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-effect border-0">
                <CardContent className="pt-6">
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full h-11"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
