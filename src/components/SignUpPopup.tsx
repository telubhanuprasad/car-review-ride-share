
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Phone, UserPlus } from 'lucide-react';
import { ConfirmationResult } from 'firebase/auth';

interface SignUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUpPopup: React.FC<SignUpPopupProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [step, setStep] = useState<'details' | 'phone' | 'otp' | 'complete'>('details');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithPhone, confirmPhoneCode } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhoneNumber('');
    setOtpCode('');
    setConfirmationResult(null);
    setStep('details');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await signup(email, password);
      setStep('phone');
      toast({
        title: "Email verified!",
        description: "Now let's verify your phone number",
      });
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

  const handlePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.startsWith('+')) {
      toast({
        title: "Error",
        description: "Please include country code (e.g., +1234567890)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await loginWithPhone(phoneNumber);
      setConfirmationResult(result);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: "Check your phone for the verification code",
      });
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

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmationResult || otpCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await confirmPhoneCode(confirmationResult, otpCode);
      setStep('complete');
      toast({
        title: "Success",
        description: "Account created and phone verified successfully!",
      });
      
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'details':
        return (
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Continue"}
            </Button>
          </form>
        );

      case 'phone':
        return (
          <form onSubmit={handlePhoneVerification} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Verify Phone Number</h3>
              <p className="text-sm text-gray-600">We'll send you a code to verify your phone</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">Include country code (e.g., +1 for US)</p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending Code..." : "Send Verification Code"}
            </Button>
            <div id="recaptcha-container"></div>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleOTPVerification} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Enter Verification Code</h3>
              <p className="text-sm text-gray-600">Enter the 6-digit code sent to {phoneNumber}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => setOtpCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading || otpCode.length !== 6}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setStep('phone')}
              disabled={loading}
            >
              Change Phone Number
            </Button>
          </form>
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Account Created Successfully!</h3>
            <p className="text-gray-600">Your email and phone number have been verified.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Account
          </DialogTitle>
          {step !== 'complete' && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <div className={`w-2 h-2 rounded-full ${step === 'details' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className={`w-2 h-2 rounded-full ${step === 'phone' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className={`w-2 h-2 rounded-full ${step === 'otp' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              </div>
            </div>
          )}
        </DialogHeader>
        
        {renderStepContent()}

        {step === 'details' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:underline font-medium"
              >
                Login here
              </button>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SignUpPopup;
