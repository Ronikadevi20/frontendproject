import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import OtpVerification from '@/components/auth/OtpVerification';
import authApi from '@/api/authApi';
import axios from 'axios'; // Ensure axios is imported

enum Step {
  REQUEST = 'request',
  VERIFY = 'verify',
  RESET = 'reset',
  SUCCESS = 'success'
}

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<Step>(Step.REQUEST);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(''); // New state for OTP
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    const data = { "email": email }

    try {
      const response = await axios.post('${import.meta.env.VITE_API_URL}/api/auth/request-password-reset', data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.data.message) {
        toast.success('Verification code sent to your email');
        setStep(Step.VERIFY);
      }
    } catch (error) {
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: any) => {
    console.log(otp)
    setOtp(otp)
    setStep(Step.RESET)
  };

  const handleResendOtp = () => {
    toast.success('Verification code resent to your email');
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    const data = {
      'email': email,
      'code': otp,
      'newPassword': newPassword
    }

    try {
      const response = await axios.post('${import.meta.env.VITE_API_URL}/api/auth/reset-password', data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(response)

      if (response.status === 200) {
        toast.success('Password reset successfully!');
        setStep(Step.SUCCESS);
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card p-8">
            {step === Step.REQUEST && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
                  <p className="mt-2 text-gray-600">Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Code"}
                  </Button>

                  <div className="text-center mt-4">
                    <Link to="/login" className="text-sm text-EncryptEase-600 hover:text-EncryptEase-700">
                      Back to Login
                    </Link>
                  </div>
                </form>
              </>
            )}

            {step === Step.VERIFY && (
              <OtpVerification
                email={email}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                onCancel={() => setStep(Step.REQUEST)}
              />
            )}

            {step === Step.RESET && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                  <p className="mt-2 text-gray-600">Create a new password for your account</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  {/* New Password Input */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`form-input pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </>
            )}

            {step === Step.SUCCESS && (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                <p className="text-gray-600 mb-6">Your password has been updated successfully.</p>
                <Button asChild className="w-full">
                  <Link to="/login">Return to Login</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ForgotPasswordPage;