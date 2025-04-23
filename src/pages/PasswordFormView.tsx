// PasswordFormView.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Copy, ExternalLink, Shield, Key, Globe, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageContainer } from '@/components/layout/PageContainer';
import passwordsApi from '@/api/passwordApi';
import { analyzePasswordStrength } from '@/services/aiClassifier';

interface PasswordData {
    id: string;
    name: string;
    username?: string;
    password_value: string;
    website_url?: string;
    notes?: string;
}

interface PasswordStrengthAnalysis {
    score: number;
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    suggestions: string[];
}

const PasswordFormView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthAnalysis | null>(null);
    const [passwordData, setPasswordData] = useState<PasswordData | null>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);

    useEffect(() => {
        const fetchPassword = async () => {
            if (!id) return;
            try {
                const response = await passwordsApi.get(id);
                setPasswordData(response);
                analyzePassword(response.password_value);
            } catch (error) {
                console.error('Error fetching password:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPassword();
    }, [id]);

    const analyzePassword = (password: string) => {
        const analysis = analyzePasswordStrength(password);
        setPasswordStrength(analysis);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(type);
        setTimeout(() => setCopiedText(null), 2000);
    };

    const visitWebsite = () => {
        if (passwordData?.website_url) {
            window.open(passwordData.website_url, '_blank', 'noopener,noreferrer');
        }
    };

    const getStrengthColor = (strength: string) => {
        switch (strength) {
            case 'weak': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'strong': return 'bg-green-500';
            case 'very-strong': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const getStrengthTextColor = (strength: string) => {
        switch (strength) {
            case 'weak': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'strong': return 'text-green-500';
            case 'very-strong': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div className="app-container py-12">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="rounded-full bg-gray-200 h-16 w-16 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (!passwordData) {
        return (
            <PageContainer>
                <div className="app-container py-12">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-lg font-medium text-gray-900">Password Not Found</h3>
                                <p className="mt-1 text-sm text-gray-500">The password you're looking for doesn't exist or you don't have permission to view it.</p>
                                <div className="mt-6">
                                    <Button onClick={() => navigate('/vault')}>
                                        Return to Vault
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="app-container max-w-4xl mx-auto py-8">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/vault')}
                        className="flex items-center gap-1 mb-4 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Vault</span>
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {passwordData.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Stored credentials and details
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main info card */}
                    <Card className="md:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Key size={20} className="text-primary" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Username */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                    Username / Email
                                </label>
                                <div className="relative flex items-center">
                                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 font-medium w-full text-gray-800">
                                        {passwordData.username || 'N/A'}
                                    </div>
                                    {passwordData.username && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 text-gray-500 hover:text-primary"
                                            onClick={() => copyToClipboard(passwordData.username || '', 'username')}
                                            aria-label="Copy username"
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    )}
                                </div>
                                {copiedText === 'username' && (
                                    <p className="text-xs text-green-600 mt-1 animate-fade-in">
                                        Copied to clipboard!
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                    Password
                                </label>
                                <div className="relative flex items-center">
                                    <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 w-full font-mono text-gray-800">
                                        {showPassword ? passwordData.password_value : '•'.repeat(Math.min(16, passwordData.password_value.length))}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-10 text-gray-500 hover:text-primary"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 text-gray-500 hover:text-primary"
                                        onClick={() => copyToClipboard(passwordData.password_value, 'password')}
                                        aria-label="Copy password"
                                    >
                                        <Copy size={16} />
                                    </Button>
                                </div>
                                {copiedText === 'password' && (
                                    <p className="text-xs text-green-600 mt-1 animate-fade-in">
                                        Copied to clipboard!
                                    </p>
                                )}

                                {/* Password strength */}
                                {passwordStrength && (
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-medium">Password Strength</span>
                                            <Badge
                                                variant="outline"
                                                className={`${getStrengthTextColor(passwordStrength.strength)} border-current`}
                                            >
                                                {passwordStrength.strength.split('-').map(
                                                    word => word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getStrengthColor(passwordStrength.strength)}`}
                                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                            ></div>
                                        </div>

                                        {passwordStrength.suggestions && passwordStrength.suggestions.length > 0 && (
                                            <Alert className="mt-3 bg-blue-50 text-blue-800 border-blue-100">
                                                <AlertDescription>
                                                    <ul className="text-xs list-disc pl-4 space-y-1 mt-1">
                                                        {passwordStrength.suggestions.map((suggestion, index) => (
                                                            <li key={index}>{suggestion}</li>
                                                        ))}
                                                    </ul>
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Website URL */}
                            {passwordData.website_url && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                                        Website URL
                                    </label>
                                    <div className="relative flex items-center">
                                        <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200 w-full text-gray-800 truncate">
                                            {passwordData.website_url}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-10 text-gray-500 hover:text-primary"
                                            onClick={() => copyToClipboard(passwordData.website_url || '', 'url')}
                                            aria-label="Copy URL"
                                        >
                                            <Copy size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 text-gray-500 hover:text-primary"
                                            onClick={visitWebsite}
                                            aria-label="Visit website"
                                        >
                                            <ExternalLink size={16} />
                                        </Button>
                                    </div>
                                    {copiedText === 'url' && (
                                        <p className="text-xs text-green-600 mt-1 animate-fade-in">
                                            Copied to clipboard!
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Additional info card */}
                    <div className="space-y-6">
                        {/* Actions Card */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl">Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => navigate(`/passwords/edit/${passwordData.id}`)}
                                    >
                                        <span className="mr-2">✏️</span> Edit Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Card */}
                        {passwordData.notes && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <FileText size={20} className="text-primary" />
                                        Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap rounded-md p-2 bg-gray-50">
                                        {passwordData.notes}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Metadata Card */}
                        <Card className="bg-gray-50">
                            <CardContent className="pt-6">
                                <div className="text-sm text-gray-500">
                                    <p>Last updated: April 10, 2025</p>
                                    <p>Created: March 15, 2025</p>
                                    <p className="mt-2">ID: {passwordData.id}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/vault')}
                    >
                        Back to Vault
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => navigate(`/passwords/edit/${passwordData.id}`)}
                    >
                        Edit Password
                    </Button>
                </div>
            </div>
        </PageContainer>
    );
};

export default PasswordFormView;