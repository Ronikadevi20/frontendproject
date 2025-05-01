import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import OtpVerification from '@/components/auth/OtpVerification';

enum LoginStep {
  CREDENTIALS = 'credentials',
  OTP = 'otp'
}

// Define types that were previously imported from authApi
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  decoy?: boolean;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginStep, setLoginStep] = useState<LoginStep>(LoginStep.CREDENTIALS);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to handle authentication response
  const handleAuthResponse = (responseData: any): User | null => {
    if (!responseData) {
      return null;
    }

    // Store the authentication token and user data
    sessionStorage.setItem("auth_token", responseData.access);
    sessionStorage.setItem("refresh_token", responseData.refresh);

    // Store user data with decoy flag if present
    const userData = {
      ...responseData.user,
      decoy: responseData.decoy || false
    };
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("isAuthenticated", "true");

    // Store decoy flag separately for easy access
    if (responseData.decoy) {
      sessionStorage.setItem("is_decoy_login", "true");
    } else {
      sessionStorage.removeItem("is_decoy_login");
    }

    return userData;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Direct Axios call instead of using authApi
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      const responseData = response.data;
      console.log('Login API response:', responseData);

      // Handle decoy login
      if (responseData?.decoy) {
        const user = handleAuthResponse(responseData);
        sessionStorage.setItem('decoy_mode', 'true');
        toast.success('Login successful');
        navigate('/dashboard');
        return;
      }

      // Handle OTP required
      if (responseData?.requires_otp) {
        toast.info('Please enter the verification code sent to your email');
        setLoginStep(LoginStep.OTP);
        return;
      }

      // Handle email not verified
      if (responseData?.code === 'EMAIL_NOT_VERIFIED') {
        toast.warning('Your email is not verified. Please check your inbox for a verification link.');
        navigate(`/verify/${formData.email}`);
        return;
      }

      // Handle regular success case
      console.log("login", responseData);

      // Check for message in different response formats
      const successMessage = responseData.message ||
        (responseData.data && responseData.data.message) ||
        'Login successful';

      toast.success(successMessage);
      handleAuthResponse(responseData);
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Login error:', error);

      // Improved error handling with custom messages
      let errorMessage = 'Login failed. Please try again.';

      if (error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;

        // Handle different error scenarios with custom messages
        if (statusCode === 401) {
          if (responseData.error === 'Invalid credentials') {
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (responseData.error === 'Account locked') {
            errorMessage = 'Your account has been locked due to multiple failed attempts. Please reset your password.';
          } else if (responseData.error === 'Account disabled') {
            errorMessage = 'Your account has been disabled. Please contact support.';
          } else {
            errorMessage = responseData.error || 'Authentication failed';
          }
        } else if (statusCode === 404) {
          errorMessage = 'Email not found. Please check your email or create a new account.';
        } else if (statusCode === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (statusCode >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = responseData.error || responseData.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (code: string) => {
    setIsLoading(true);

    try {
      // Direct Axios call instead of using authApi
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth//verify-login-otp`, {
        email: formData.email,
        otp_code: code
      });

      const responseData = response.data;
      const user = handleAuthResponse(responseData);

      if (!user) {
        throw new Error('Verification failed');
      }

      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('OTP verification error:', error);

      let errorMessage = 'Verification failed. Please try again.';

      if (error.response?.data?.error) {
        if (error.response.data.error === 'Invalid OTP') {
          errorMessage = 'Invalid verification code. Please check and try again.';
        } else if (error.response.data.error === 'OTP expired') {
          errorMessage = 'Verification code has expired. Please request a new one.';
        } else {
          errorMessage = error.response.data.error;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      // Direct Axios call instead of using authApi
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      const responseData = response.data;

      if (responseData.error) {
        throw new Error(responseData.error);
      }

      toast.success('Verification code resent. Please check your email.');
    } catch (error: any) {
      console.error('Resend OTP error:', error);

      let errorMessage = 'Failed to resend verification code';

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <PageContainer>
      <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card p-8">
            {loginStep === LoginStep.CREDENTIALS ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                  <p className="mt-2 text-gray-600">Log in to your JobVault account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-sm text-jobvault-600 hover:text-jobvault-700">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging In..." : "Log In"}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-jobvault-600 hover:text-jobvault-700 font-medium">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <OtpVerification
                email={formData.email}
                onVerify={handleOtpVerify as any}
                onResend={handleResendOtp}
                onCancel={() => setLoginStep(LoginStep.CREDENTIALS)}
              />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default LoginPage;