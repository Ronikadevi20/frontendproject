
import { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

interface TextFieldProps {
  id: string;
  name: string;
  label: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  min?: string | number;
  step?: string;
  className?: string;
}

export const TextField = ({
  id,
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  type = 'text',
  className = '',
  ...props
}: TextFieldProps) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && '*'}
      </label>
      <Input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? 'border-red-500' : ''}`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export const AmountField = ({ 
  id, 
  name, 
  value, 
  onChange, 
  error,
  className = ''
}: Omit<TextFieldProps, 'label' | 'type'> & { value: number }) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        Amount*
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
        <Input
          type="number"
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          step="0.01"
          min="0"
          className={`form-input pl-7 ${error ? 'border-red-500' : ''}`}
          placeholder="0.00"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export const TextAreaField = ({ 
  id, 
  name, 
  label, 
  value, 
  onChange, 
  placeholder,
  className = '' 
}: Omit<TextFieldProps, 'type'>) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={3}
        value={value}
        onChange={onChange}
        className="form-input w-full"
        placeholder={placeholder}
      ></textarea>
    </div>
  );
};
