import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import useAuth from '@/hooks/useAuth';
import authApi from '@/api/authApi';

const ProfileSettings = ({ user }) => {
    const [profileForm, setProfileForm] = useState({
        username: '',
        email: ''
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isPasswordEditing, setIsPasswordEditing] = useState(false);
    const { updateUser } = useAuth();

    useEffect(() => {
        if (user) {
            setProfileForm({ username: user.username, email: user.email });
        }
    }, [user]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUser({ username: profileForm.username, email: profileForm.email });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        try {
            await authApi.confirmPasswordReset({
                email: user.email,
                code: passwordForm.currentPassword, // This might need adjustment based on your API
                newPassword: passwordForm.newPassword
            });

            toast.success('Password updated successfully');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setIsPasswordEditing(false);
        } catch (error) {
            toast.error('Failed to update password');
        }
    };

    return (
        <section className="glass-card p-6 space-y-8">
            <h2 className="text-xl font-semibold">Profile Information</h2>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                        value={profileForm.username}
                        disabled
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        type="email"
                        disabled
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                </div>
            </form>

            <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Password</h2>
                    <Button
                        variant="outline"
                        onClick={() => setIsPasswordEditing(!isPasswordEditing)}
                    >
                        {isPasswordEditing ? 'Cancel' : 'Change Password'}
                    </Button>
                </div>

                {isPasswordEditing && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({
                                    ...passwordForm,
                                    currentPassword: e.target.value
                                })}
                                placeholder="Enter your current password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({
                                    ...passwordForm,
                                    newPassword: e.target.value
                                })}
                                placeholder="Enter your new password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirm New Password</Label>
                            <Input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({
                                    ...passwordForm,
                                    confirmPassword: e.target.value
                                })}
                                placeholder="Confirm your new password"
                            />
                        </div>
                        <Button type="submit">Update Password</Button>
                    </form>
                )}
            </div>
        </section>
    );
};

export default ProfileSettings;