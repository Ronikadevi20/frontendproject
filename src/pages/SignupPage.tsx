import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import OtpVerification from '@/components/auth/OtpVerification';
import { authApi } from '@/api/authApi';

enum SignupStep {
  FORM = 'form',
  OTP = 'otp'
}

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignupStep>(SignupStep.FORM);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.username.trim()) {
      newErrors.name = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.name = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { email, username, password, confirmPassword } = formData;
      const response = await authApi.signup({ email, username, password, password2: confirmPassword });

      // Check for errors in response
      if (response.error) {
        console.log(response)
        toast.error(response.error)
        return;
      }

      console.log('Signup API response:', response);
      toast.success('Verification code sent to your email');
      setStep(SignupStep.OTP);
    } catch (error: any) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupError = (error: any) => {
    console.log('Processing error:', error);

    // For the specific format: "error: Invalid data provided.; details: {'email': [ErrorDetail...]}"
    if (error.error && typeof error.error === 'string' && error.details) {
      const fieldErrors: Record<string, string> = {};

      // Process the details object
      Object.entries(error.details).forEach(([field, fieldErrors]) => {
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          // Get the first error message
          const errorDetail = fieldErrors[0];
          if (typeof errorDetail === 'object' && 'string' in errorDetail) {
            // Set the field error in our state
            if (field === 'email') {
              setErrors(prev => ({ ...prev, email: errorDetail.string }));
              toast.error(errorDetail.string);
            } else if (field === 'username') {
              setErrors(prev => ({ ...prev, name: errorDetail.string }));
              toast.error(errorDetail.string);
            } else {
              // For other fields
              setErrors(prev => ({ ...prev, [field]: errorDetail.string }));
              toast.error(errorDetail.string);
            }
            return; // Return after setting the first field error
          }
        }

        // Handle case where fieldErrors is a string
        if (typeof fieldErrors === 'string') {
          if (field === 'email') {
            setErrors(prev => ({ ...prev, email: fieldErrors }));
          } else if (field === 'username') {
            setErrors(prev => ({ ...prev, name: fieldErrors }));
          } else {
            setErrors(prev => ({ ...prev, [field]: fieldErrors }));
          }
          toast.error(fieldErrors);
          return;
        }
      });

      // If no specific field error was processed, show the general error
      if (Object.keys(fieldErrors).length === 0 && error.error) {
        toast.error(error.error);
      }

      return;
    }

    // Handle standard response error format
    if (error.response?.data) {
      const responseData = error.response.data;
      // Handle any other standard error message
      if (responseData.error || responseData.message) {
        toast.error(responseData.error || responseData.message);
        return;
      }
    }

    // Handle errors as strings
    if (typeof error === 'string') {
      toast.error(error);
      return;
    }

    // Handle error objects with message property
    if (error.message) {
      // Check if the message contains a JSON string (common for axios errors)
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.error) {
          toast.error(parsedError.error);
          return;
        }
      } catch (e) {
        // Not JSON, use the message directly
        toast.error(error.message);
        return;
      }
    }

    // Network errors
    if (error.request && !error.response) {
      toast.error('Network error. Please check your connection and try again.');
      return;
    }

    // Default error message
    toast.error('An error occurred during signup. Please try again.');
  };

  const handleVerifyOtp = async (code: string) => {
    setIsLoading(true);
    console.log('Verifying OTP:', code);

    try {
      const response = await authApi.verifySignupOtp({
        email: formData.email,
        otp_code: code
      });

      console.log('Verify OTP response:', response);

      if (response.error) {
        handleOtpError(response);
        return;
      }

      toast.success('Account verified successfully!');
      navigate('/login');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      handleOtpError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpError = (error: any) => {
    // Handle different OTP verification error types
    if (error.error && typeof error.error === 'string') {
      // Extract error message from the specific format
      const errorMessage = error.error;

      if (errorMessage.includes('invalid') || errorMessage.includes('incorrect')) {
        toast.error('Incorrect verification code. Please try again.');
      } else if (errorMessage.includes('expired')) {
        toast.error('Verification code has expired. Please request a new one.');
      } else {
        toast.error(errorMessage);
      }
      return;
    }

    if (typeof error === 'string') {
      // Handle specific OTP error messages
      if (error.includes('invalid') || error.includes('incorrect')) {
        toast.error('Incorrect verification code. Please try again.');
      } else if (error.includes('expired')) {
        toast.error('Verification code has expired. Please request a new one.');
      } else {
        toast.error(error);
      }
      return;
    }

    if (error.response?.data) {
      const responseData = error.response.data;

      if (responseData.error === 'Invalid OTP' || responseData.error === 'Incorrect OTP') {
        toast.error('Incorrect verification code. Please try again.');
        return;
      }

      if (responseData.error === 'OTP expired') {
        toast.error('Verification code has expired. Please request a new one.');
        return;
      }

      if (responseData.error) {
        toast.error(responseData.error);
        return;
      }
    }

    // Default error message
    toast.error('Verification failed. Please try again.');
  };

  const handleResendOtp = async () => {
    try {
      const response = await authApi.signup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        password2: formData.confirmPassword
      });

      if (response.error) {
        handleSignupError(response);
        return;
      }

      toast.success('Verification code resent to your email');
    } catch (error: any) {
      console.error('Resend OTP error:', error);

      // Check if it's an error due to too many attempts
      if (error.response?.status === 429) {
        toast.error('Too many resend attempts. Please wait before trying again.');
        return;
      }

      handleSignupError(error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <PageContainer>
      <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="glass-card p-8">
            {step === SignupStep.FORM ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Create an Account</h2>
                  <p className="mt-2 text-gray-600">Join EncryptEase to organize your job search</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="johndoe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

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
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
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
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Sign Up"}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-EncryptEase-600 hover:text-EncryptEase-700 font-medium">
                      Log In
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <OtpVerification
                email={formData.email}
                onVerify={handleVerifyOtp as any}
                onResend={handleResendOtp}
                onCancel={() => setStep(SignupStep.FORM)}
              />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default SignupPage;