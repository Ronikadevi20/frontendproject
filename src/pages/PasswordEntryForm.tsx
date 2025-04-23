// PasswordEntryForm.tsx
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { classifyPassword, passwordCategories, analyzePasswordStrength } from '@/services/aiClassifier';
import { PageContainer } from '@/components/layout/PageContainer';
import passwordsApi from '@/api/passwordApi';

interface PasswordEntryFormProps {
    isEditMode: boolean;
    id?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

interface PasswordData {
    name: string;
    username?: string;
    password_value: string;
    website_url?: string;
    notes?: string;
}

interface PasswordEntry extends PasswordData {
    id: string;
}

interface ErrorState {
    [key: string]: string;
}

interface RouteParams extends Record<string, string | undefined> {
    id?: string;
}


interface PasswordStrengthAnalysis {
    score: number;
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    suggestions: string[];
}

const PasswordEntryForm = () => {
    const params = useParams<RouteParams>();
    const id = params.id;
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthAnalysis | null>(null);
    const [errors, setErrors] = useState<ErrorState>({});

    const [passwordData, setPasswordData] = useState<PasswordData>({
        name: '',
        username: '',
        password_value: '',
        website_url: '',
        notes: '',
    });

    const onCancel = () => {
        navigate('/vault');
    };

    useEffect(() => {
        // Load data if in edit mode
        const fetchPasswordToUpdate = async () => {
            if (!isEditMode || !id) return;
            setIsLoading(true);
            try {
                const response = await passwordsApi.get(id);
                setPasswordData(response);
            } catch (error) {
                console.error('Error fetching password:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPasswordToUpdate();
    }, [isEditMode, id]);

    useEffect(() => {
        // Analyze password strength
        if (passwordData.password_value) {
            const analysis = analyzePasswordStrength(passwordData.password_value);
            setPasswordStrength(analysis);
        } else {
            setPasswordStrength(null);
        }
    }, [passwordData.website_url, passwordData.password_value]);

    const handlePasswordChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ErrorState = {};

        if (!passwordData.website_url.trim()) {
            newErrors.website = 'Website/Application name is required';
        }

        if (!passwordData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!passwordData.password_value) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            let response = null;
            if (isEditMode && id) {
                response = await passwordsApi.update(id, passwordData);
                toast.success("Password updated")
                navigate('/vault')
            } else {
                response = await passwordsApi.create(passwordData)
                toast.success("Password saved")
                navigate('/vault')
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (): void => {
        setShowPassword(!showPassword);
    };

    const generatePassword = (): void => {
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        setPasswordData(prev => ({
            ...prev,
            password_value: password
        }))

        // Show the generated password
        setShowPassword(true);
    };

    return (
        <PageContainer>
            <div className="app-container py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/vault')}
                            className="flex items-center gap-1"
                        >
                            <ArrowLeft size={16} />
                            <span>Back to Vault</span>
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode
                            ? 'Edit Password'
                            : 'Add New Password'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {isEditMode
                            ? 'Update your stored information securely.' :
                            'Add a new password to your secure vault.'
                        }
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                Website / Application Name*
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={passwordData.name}
                                onChange={handlePasswordChange}
                                className={`form-input ${errors.website ? 'border-red-500' : ''}`}
                                placeholder="e.g. LinkedIn, Indeed, Glassdoor"
                            />
                            {errors.website && (
                                <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username / Email*
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={passwordData.username}
                                onChange={handlePasswordChange}
                                className={`form-input ${errors.username ? 'border-red-500' : ''}`}
                                placeholder="your.email@example.com"
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password_value" className="block text-sm font-medium text-gray-700 mb-1">
                                Password*
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password_value"
                                    name="password_value"
                                    value={passwordData.password_value}
                                    onChange={handlePasswordChange}
                                    className={`form-input pr-24 ${errors.password ? 'border-red-500' : ''}`}
                                    placeholder="Your secure password"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center">
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="px-2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={generatePassword}
                                        className="text-xs mr-2 text-EncryptEase-600 hover:text-EncryptEase-700"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}

                            {/* Password strength indicator */}
                            {passwordStrength && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">Password Strength:</span>
                                        <span className={`text-xs font-medium ${passwordStrength.strength === 'weak' ? 'text-red-500' :
                                            passwordStrength.strength === 'medium' ? 'text-yellow-500' :
                                                passwordStrength.strength === 'strong' ? 'text-green-500' : 'text-blue-500'
                                            }`}>
                                            {passwordStrength.strength === 'weak' ? 'Weak' :
                                                passwordStrength.strength === 'medium' ? 'Medium' :
                                                    passwordStrength.strength === 'strong' ? 'Strong' : 'Very Strong'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded h-1">
                                        <div
                                            className={`h-1 rounded ${passwordStrength.strength === 'weak' ? 'bg-red-500' :
                                                passwordStrength.strength === 'medium' ? 'bg-yellow-500' :
                                                    passwordStrength.strength === 'strong' ? 'bg-green-500' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                    {passwordStrength.suggestions.length > 0 && (
                                        <div className="mt-2">
                                            <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                                                {passwordStrength.suggestions.map((suggestion, index) => (
                                                    <li key={index}>{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                                Website URL
                            </label>
                            <input
                                type="website_url"
                                id="website_url"
                                name="website_url"
                                value={passwordData.website_url}
                                onChange={handlePasswordChange}
                                className="form-input"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={3}
                                value={passwordData.notes}
                                onChange={handlePasswordChange}
                                className="form-input"
                                placeholder="Add any additional notes..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading
                                ? isEditMode ? "Updating..." : "Saving..."
                                : isEditMode ? "Update Password" : "Save Password"
                            }
                        </Button>
                    </div>
                </form>
            </div>
        </PageContainer>
    );
};

export default PasswordEntryForm;