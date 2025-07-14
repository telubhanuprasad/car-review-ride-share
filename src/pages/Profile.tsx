import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, LogOut, ArrowLeft, Save, Edit2, Camera, History } from 'lucide-react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import BookingHistory from '@/components/BookingHistory';

interface UserProfile {
  username: string;
  email: string;
  phoneNumber: string;
  profilePhoto: string;
}

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    profilePhoto: ''
  });

  useEffect(() => {
    if (currentUser) {
      loadUserProfile();
    }
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setProfile({
          username: userData.username || '',
          email: userData.email || currentUser.email || '',
          phoneNumber: userData.phoneNumber || currentUser.phoneNumber || '',
          profilePhoto: userData.profilePhoto || ''
        });
      } else {
        // Set default values from Firebase Auth
        setProfile(prev => ({
          ...prev,
          email: currentUser.email || '',
          phoneNumber: currentUser.phoneNumber || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const saveUserProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await setDoc(doc(db, 'users', currentUser.uid), profile);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Update profile with new photo
        const updatedProfile = { ...profile, profilePhoto: base64String };
        setProfile(updatedProfile);
        
        // Save to database
        await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
        
        toast({
          title: "Success",
          description: "Profile photo updated successfully!",
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Booking History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 relative">
                  <Avatar className="w-20 h-20 cursor-pointer group" onClick={handlePhotoClick}>
                    <AvatarImage src={profile.profilePhoto} alt="Profile" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </Avatar>
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  Profile
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="Enter your username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={profile.phoneNumber}
                          onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">User ID</p>
                        <p className="font-medium text-xs break-all">{currentUser.uid}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="h-5 w-5 flex items-center justify-center">
                        <div className={`h-3 w-3 rounded-full ${currentUser.emailVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email Status</p>
                        <p className="font-medium">{currentUser.emailVerified ? 'Verified' : 'Not Verified'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t space-y-3">
                    {isEditing && (
                      <Button
                        onClick={saveUserProfile}
                        disabled={loading}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Saving..." : "Save Profile"}
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <BookingHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
