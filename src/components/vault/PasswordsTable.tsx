import { Eye, EyeOff, Trash2, Edit, ArrowUpDown, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryById } from '@/services/aiClassifier';
import authApi from '@/api/authApi';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import passwordsApi from '@/api/passwordApi';
import { toast } from 'sonner';

interface PasswordEntry {
    id: string;
    website_url: string;
    name: string;
    username: string;
    password_value: string;
    notes?: string;
    category: string;
    created_at: string;
    updated_at: string;
    url?: string;
}

interface PasswordsTableProps {
    passwords: PasswordEntry[];
    visiblePasswords: Record<string, boolean>;
    togglePasswordVisibility: (id: string) => void;
    copyToClipboard: (text: string) => void;
    handleSort: (field: 'website_url' | 'username' | 'name' | 'dueDate') => void;
    sortField: 'website_url' | 'username' | 'name' | 'dueDate';
    sortDirection: 'asc' | 'desc';
    handleDelete: (pwd: PasswordEntry) => void;
    navigate: (path: string) => void;
}

const SharePasswordModal = ({ passwordEntry }: { passwordEntry: PasswordEntry }) => {
    const [email, setEmail] = useState('');
    const [hours, setHours] = useState(24);
    const [isSending, setIsSending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async () => {
        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (hours < 1 || hours > 720) {
            toast.error('Please enter a duration between 1 and 720 hours (30 days)');
            return;
        }

        setIsSending(true);
        try {
            // First create the share link
            const shareResponse = await passwordsApi.share(passwordEntry.id, { hours });

            if (!shareResponse) {
                throw new Error('Failed to create share link');
            }

            // Then send the email with the share link
            const emailContent = `
                <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #1a365d;">Password Sharing from EncryptEase</h2>
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #2d3748; margin-bottom: 15px;">🔗 Shared Password Access</h3>
                            <p>You've been granted temporary access to a password:</p>
                            
                            <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 6px;">
                                <p style="margin: 0;">
                                    <strong>${passwordEntry.name}</strong><br/>
                                    <span style="color: #4a5568;">Expires in ${hours} hours</span>
                                </p>
                            </div>

                            <a href="${shareResponse.share_url}" 
                               style="display: inline-block; padding: 12px 24px; background-color: #4299e1; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px;">
                                Access Shared Password
                            </a>

                            <p style="margin-top: 25px; color: #718096; font-size: 0.9em;">
                                ⚠️ Important: This link will expire at ${new Date(shareResponse.expires_at).toLocaleString()}.<br/>
                                Do not forward this email or share the link with others.
                            </p>
                        </div>
                    </body>
                </html>
            `;

            await authApi.sendEmail(
                "Secure Password Sharing from EncryptEase",
                emailContent,
                [email]
            );

            toast.success(`Share link sent to ${email}`);
            setIsOpen(false);
            setEmail('');
            setHours(24);
        } catch (error) {
            console.error('Sharing failed:', error);
            toast.error('Failed to share password. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {(sessionStorage.getItem('decoy_mode') !== 'true') && (
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-blue-600"
                    >
                        <Share2 size={16} />
                        <span className="sr-only">Share</span>
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Recipient Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="recipient@example.com"
                        />
                    </div>

                    <div>
                        <Label htmlFor="hours">Access Duration *</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="hours"
                                type="number"
                                min="1"
                                max="720"
                                value={hours}
                                onChange={(e) => setHours(Math.min(720, Math.max(1, parseInt(e.target.value) || 1)))}
                            />
                            <span className="text-sm">hours</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Link will expire after {hours} hour{hours !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isSending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSending || !email}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSending ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : 'Share Password'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const PasswordsTable = ({
    passwords,
    visiblePasswords,
    togglePasswordVisibility,
    copyToClipboard,
    handleSort,
    sortField,
    sortDirection,
    handleDelete,
    navigate
}: PasswordsTableProps) => {
    const [isDecoyMode, setIsDecoyMode] = useState(false);

    useEffect(() => {
        setIsDecoyMode(sessionStorage.getItem('decoy_mode') === 'true');
    }, []);

    const maskPassword = (password: string) => {
        return '•'.repeat(Math.min(10, password.length));
    };

    const generateDecoyPassword = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 10 }, () =>
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
    };

    if (passwords.length === 0) {
        return (
            <div className="text-center py-12 glass-card">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
                <p className="mt-4 text-lg text-gray-600">No passwords found</p>
                <p className="text-gray-500 mb-4">Start securing your passwords</p>
                <Button onClick={() => navigate('/passwords/new')}>
                    Add Your First Password
                </Button>
            </div>
        );
    }

    return (
        <div className="glass-card animate-slide-in overflow-x-auto">
            <h3 className="px-6 py-3 bg-gray-50 font-medium flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5 mr-2 text-gray-600"
                >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Passwords
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-left">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    className="flex items-center space-x-1 focus:outline-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <span>Website/Application</span>
                                    {sortField === 'name' && (
                                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => handleSort('website_url')}
                                    className="flex items-center space-x-1 focus:outline-none"
                                >
                                    <span>Website URL</span>
                                    {sortField === 'website_url' && (
                                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <button
                                    onClick={() => handleSort('username')}
                                    className="flex items-center space-x-1 focus:outline-none"
                                >
                                    <span>Username</span>
                                    {sortField === 'username' && (
                                        <ArrowUpDown size={14} className={sortDirection === 'asc' ? 'rotate-180' : ''} />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center space-x-1">
                                    <span>Created At</span>
                                    <Eye size={14} className="text-gray-400" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {passwords.map((pwd) => (
                            <tr key={pwd.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{pwd.name}</div>
                                    {pwd.name && (
                                        <p className="text-xs text-EncryptEase-600 hover:underline">
                                            {pwd.name.substring(0, 30)}{pwd.name.length > 30 && '...'}
                                        </p>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{pwd.website_url}</div>
                                    {pwd.website_url && (
                                        <a
                                            href={pwd.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-EncryptEase-600 hover:underline"
                                        >
                                            {pwd.website_url.substring(0, 30)}{pwd.website_url.length > 30 && '...'}
                                        </a>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <span>{pwd.username}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && copyToClipboard(pwd.username) }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="h-4 w-4"
                                            >
                                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                            </svg>
                                        </Button>
                                    </div>
                                </td>

                                <td className='px-6 py-4'>
                                    <div className="flex items-center space-x-2">
                                        <span className='text-xs'>{pwd.created_at}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <Badge
                                            className="text-xs"
                                            style={{
                                                backgroundColor: `${getCategoryById(pwd.category)?.color || '#888'}20`,
                                                color: getCategoryById(pwd.category)?.color || '#888',
                                                borderColor: `${getCategoryById(pwd.category)?.color || '#888'}50`
                                            }}
                                        >
                                            {pwd.category || 'Other'}
                                        </Badge>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end space-x-2">
                                        {
                                            localStorage.getItem('shared_password') === 'true' && (
                                                <SharePasswordModal passwordEntry={pwd} />
                                            )
                                        }
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/passwords/view/${pwd.id}`) }}
                                        >
                                            <Eye size={16} color="blue" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && navigate(`/passwords/edit/${pwd.id}`) }}
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => { sessionStorage.getItem('decoy_mode') !== 'true' && handleDelete(pwd) }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PasswordsTable;