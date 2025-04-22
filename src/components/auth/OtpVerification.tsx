import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OtpVerificationProps {
  email: string;
  onVerify: (otp: string) => void
  onResend: () => void;
  onCancel: () => void;
}

const OtpVerification = ({ email, onVerify, onResend, onCancel }: OtpVerificationProps) => {
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (value.length > 1) return;

    const newOtp = otp.split('');
    newOtp[index] = value;
    setOtp(newOtp.join(''));

    if (value && index < 5) {
      const nextSibling = document.getElementById(`otp-input-${index + 1}`);
      nextSibling?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevSibling = document.getElementById(`otp-input-${index - 1}`);
      prevSibling?.focus();
    }
  };

  // New paste handler function
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\s/g, '');

    if (pastedData.length === 6) {
      setOtp(pastedData);
      // Focus the last input after paste
      const lastInput = document.getElementById(`otp-input-5`);
      lastInput?.focus();
    } else {
      toast.error('Please paste a valid 6-digit code');
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onVerify(otp);
    } catch (error) {
      toast.error('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Verification code resent!');
      onResend();
    } catch (error) {
      toast.error('Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Verification Code</h2>
        <p className="mt-2 text-gray-600">
          We've sent a 6-digit verification code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="flex justify-center pt-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            type="text"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}  // Added paste handler
            autoComplete="one-time-code"
            className="h-10 w-10 border border-gray-300 text-center text-xl mx-1 rounded-md focus:border-EncryptEase-600 focus:outline-none focus:ring-EncryptEase-600"
          />
        ))}
      </div>


      <div className="flex flex-col gap-3 pt-2">
        <Button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isLoading}
          className="w-full"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-EncryptEase-600 hover:text-EncryptEase-700"
            disabled={isLoading}
          >
            Resend Code
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;