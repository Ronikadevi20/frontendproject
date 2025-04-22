import { useState, useEffect } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { settingsApi } from '@/api/settingsApi';
import { Loader2 } from 'lucide-react';

const Notifications = ({ settings }) => {
    const [loadingType, setLoadingType] = useState<string | null>(null);
    const [notificationSettings, setNotificationSettings] = useState({
        email: false,
        push: false,
        security: false, // Decoy toggle
    });

    useEffect(() => {
        if (settings) {
            const securityStatus = sessionStorage.getItem('security_notifications') === 'true';
            setNotificationSettings({
                email: settings.enable_email_alerts || false,
                push: settings.enable_notifications || false,
                security: securityStatus,
            });
        }
    }, [settings]);

    const handleNotificationChange = async (
        type: 'email' | 'push' | 'security',
        enabled: boolean
    ) => {
        if (type === 'security') {
            sessionStorage.setItem('security_notifications', String(enabled));
            setNotificationSettings((prev) => ({
                ...prev,
                security: enabled,
            }));
            return;
        }

        let updateData: settingsApi.UserSettingsUpdateDTO = {};
        switch (type) {
            case 'email':
                updateData.enable_email_alerts = enabled;
                break;
            case 'push':
                updateData.enable_notifications = enabled;
                break;
            default:
                return;
        }

        setLoadingType(type);
        try {
            await settingsApi.updateSettings(updateData);
            setNotificationSettings((prev) => ({
                ...prev,
                [type]: enabled,
            }));
        } catch (error) {
            console.error('Failed to update notification settings:', error);
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
            <div className="space-y-6">
                {['email', 'push', 'security'].map((type) => (
                    <div className="flex items-center justify-between" key={type}>
                        <div>
                            <Label>{type.charAt(0).toUpperCase() + type.slice(1)} Notifications</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            {loadingType === type && type !== 'security' ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                            ) : (
                                <Switch
                                    checked={notificationSettings[type]}
                                    onCheckedChange={(checked) =>
                                        handleNotificationChange(
                                            type as 'email' | 'push' | 'security',
                                            checked
                                        )
                                    }
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Notifications;
