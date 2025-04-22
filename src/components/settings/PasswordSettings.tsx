import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';


const PasswordSettings = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        // Submit logic here
    };

    return (
        <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Password Settings</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label>Current Password</Label>
                    <div className="relative">
                        <Input type={showPassword ? 'text' : 'password'} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type={showPassword ? 'text' : 'password'} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                </div>
                <Button type="submit">Update Password</Button>
            </form>
        </section>
    );
};

export default PasswordSettings;