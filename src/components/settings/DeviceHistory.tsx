import { useState, useEffect } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import { authApi } from '@/api/authApi';

const DeviceHistory = () => {
    const [decoyMode, setDecoyMode] = useState(false);
    const [showDecoyModal, setShowDecoyModal] = useState(false);
    const [decoyPassword, setDecoyPassword] = useState('');
    const [confirmDecoyPassword, setConfirmDecoyPassword] = useState('');
    const [isSettingDecoy, setIsSettingDecoy] = useState(false);
    const { toast } = useToast();


    // Check sessionStorage on mount to determine if decoy mode is active
    useEffect(() => {
        const storedMode = sessionStorage.getItem('decoy_mode') === 'true';
        setDecoyMode(storedMode);
    }, []);

    // Toggle Decoy Mode - show modal if enabling
    const handleDecoyModeToggle = (enabled: boolean) => {
        if (enabled) {
            setShowDecoyModal(true);
        } else {
            setDecoyMode(false);
            sessionStorage.setItem('decoy_mode', 'false');
        }
    };

    const handleSetDecoyPassword = async () => {
        if (decoyPassword !== confirmDecoyPassword) {
            toast({
                title: 'Error',
                description: 'Passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (decoyPassword.length < 6) {
            toast({
                title: 'Error',
                description: 'Password must be at least 6 characters',
                variant: 'destructive',
            });
            return;
        }

        setIsSettingDecoy(true);
        try {
            await authApi.setDecoyPassword({ decoy_password: decoyPassword });
            toast({
                title: 'Success',
                description: 'Decoy password set successfully. It will expire in 24 hours.',
            });
            setDecoyMode(true);
            sessionStorage.setItem('decoy_mode', 'true');
            setShowDecoyModal(false);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to set decoy password',
                variant: 'destructive',
            });
        } finally {
            setIsSettingDecoy(false);
        }
    };

    return (
        <section className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4">EncryptEase</h3>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <Label>Decoy Mode</Label>
                    <p className="text-sm text-muted-foreground">
                        {decoyMode ? 'Showing decoy information' : 'Showing real information'}
                    </p>
                </div>
                <Switch
                    checked={decoyMode}
                    onCheckedChange={handleDecoyModeToggle}
                />
            </div>

            {/* Device list */}
            <div className="p-6 border rounded-lg bg-gray-50 border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">You are viewing your real account data.</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Everything displayed here is your actual data: real passwords, bills, documents, and job applications.
                    If you're in a situation where you need to open EncryptEase in front of someone else, you can switch to
                    <strong> Decoy Mode</strong>.
                    <br /><br />
                    When someone logs in using your <strong>Decoy Password</strong>, they’ll see a completely fake version of your dashboard
                    with dummy data. This helps you protect sensitive information and maintain privacy, especially in emergencies or high-risk scenarios.
                    <br /><br />
                    For your security, you'll receive an email notification if your decoy password is used, and you'll be required
                    to set a new deocy password afterward. Decoy Mode automatically expires after one login with that password.
                </p>
            </div>

            {/* Decoy Password Modal */}
            <Dialog open={showDecoyModal} onOpenChange={setShowDecoyModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Decoy Password</DialogTitle>
                        <DialogDescription>
                            This password will allow access to decoy information and will only work for 24 hours.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="decoy-password">Decoy Password</Label>
                            <Input
                                id="decoy-password"
                                type="password"
                                value={decoyPassword}
                                onChange={(e) => setDecoyPassword(e.target.value)}
                                placeholder="Enter decoy password"
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirm-decoy-password">Confirm Decoy Password</Label>
                            <Input
                                id="confirm-decoy-password"
                                type="password"
                                value={confirmDecoyPassword}
                                onChange={(e) => setConfirmDecoyPassword(e.target.value)}
                                placeholder="Confirm decoy password"
                            />
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Important:</strong> This password will expire in 24 hours. Anyone using this password will only see decoy information.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowDecoyModal(false)}
                                disabled={isSettingDecoy}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSetDecoyPassword}
                                disabled={isSettingDecoy || !decoyPassword || !confirmDecoyPassword}
                            >
                                {isSettingDecoy ? 'Setting...' : 'Set Decoy Password'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default DeviceHistory;