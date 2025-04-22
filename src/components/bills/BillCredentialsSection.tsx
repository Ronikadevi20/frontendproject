
import { ChangeEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField } from './BillFormFields';

interface Credentials {
  website?: string;
  username?: string;
  password?: string;
  url?: string;
}

interface BillCredentialsSectionProps {
  credentials: Credentials;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  showCredentials: boolean;
  onToggleShow: () => void;
}

const BillCredentialsSection = ({
  credentials,
  onChange,
  showCredentials,
  onToggleShow,
}: BillCredentialsSectionProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  if (!showCredentials) {
    return (
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Login Credentials
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleShow}
        >
          Add Credentials
        </Button>
      </div>
    );
  }

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Login Credentials
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleShow}
        >
          Hide Credentials
        </Button>
      </div>

      <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
        <TextField
          id="credentials.website"
          name="credentials.website"
          label="Website / Portal Name"
          value={credentials.website || ''}
          onChange={onChange}
          placeholder="e.g. Electric Company Portal"
          className="mb-2"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            id="credentials.username"
            name="credentials.username"
            label="Username / Email"
            value={credentials.username || ''}
            onChange={onChange}
            placeholder="your.email@example.com"
          />

          <div>
            <label htmlFor="credentials.password" className="block text-xs font-medium text-gray-500 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="credentials.password"
                name="credentials.password"
                value={credentials.password || ''}
                onChange={onChange}
                className="form-input text-sm pr-10 w-full"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>

        <TextField
          id="credentials.url"
          name="credentials.url"
          label="Website URL"
          value={credentials.url || ''}
          onChange={onChange}
          placeholder="https://..."
          type="url"
        />
      </div>
    </div>
  );
};

export default BillCredentialsSection;
