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
    const [isPasswordShared, setIsPasswordShared] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        try {
            const storedValue = sessionStorage.getItem('shared_password');
            setIsPasswordShared(storedValue === 'true');
        } catch (error) {
            console.error('Error accessing sessionStorage:', error);
        }
    }, []);

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

    const deviceHistory = [
        { id: 1, device: 'Chrome on Windows', ip: '192.168.1.1', time: '2024-03-20 14:30' },
        { id: 2, device: 'Safari on iPhone', ip: '192.168.1.2', time: '2024-03-19 09:15' },
    ];

    const decoyData = [
        { id: 1, device: 'Decoy Device 1', ip: '0.0.0.0', time: '2024-01-01 00:00' },
        { id: 2, device: 'Decoy Device 2', ip: '0.0.0.0', time: '2024-01-01 00:01' },
    ];

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

            <div className="flex justify-between items-center mb-6">
                <div>
                    <Label>Share Password</Label>
                    <p className="text-sm text-muted-foreground">
                        {isPasswordShared ? 'Password is currently shared' : 'Password is private'}
                    </p>
                </div>
                <Switch
                    checked={isPasswordShared}
                    onCheckedChange={(checked) => {
                        try {
                            sessionStorage.setItem('shared_password', String(checked));
                            setIsPasswordShared(checked);
                        } catch (error) {
                            console.error('Error updating sessionStorage:', error);
                            toast({
                                title: 'Error',
                                description: 'Failed to update password sharing setting',
                                variant: 'destructive',
                            });
                        }
                    }}
                />
            </div>

            {/* Device list */}
            {(decoyMode ? decoyData : deviceHistory).map((device) => (
                <div key={device.id} className="flex justify-between items-center p-4 border rounded-lg mb-2">
                    <div>
                        <p className="font-medium">{device.device}</p>
                        <p className="text-sm text-muted-foreground">{device.ip} • {device.time}</p>
                    </div>
                </div>
            ))}

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