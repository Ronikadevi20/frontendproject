import { PageContainer } from '@/components/layout/PageContainer';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import settingsApi, { UserSettingsUpdateDTO } from "@/api/settingsApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AccountSettings from "@/components/settings/AccountSettings";
import useAuth from "@/hooks/useAuth"; // Import the useAuth hook

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, isLoading, logout } = useAuth(); // Use the hook
    const [settings, setSettings] = useState<UserSettingsUpdateDTO | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            console.log(user);
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                const settingsData = await settingsApi.getSettings();
                if (settingsData) {
                    setSettings(settingsData);
                    setSettingsLoading(false);
                }
            } catch (error) {
                toast.error('Failed to load settings data');
            }
        };

        loadSettings();
    }, [user, navigate]);

    const updateSettings = async () => {
        if (!settings) return;

        setIsSaving(true);
        try {
            const updatedSettings = await settingsApi.updateSettings(settings);
            setSettings(updatedSettings);
            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || settingsLoading) {
        return (
            <PageContainer>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-EncryptEase-600"></div>
                </div>
            </PageContainer>
        );
    }

    if (!user || !settings) {
        return (
            <PageContainer>
                <div className="text-center py-12">
                    <p className="text-red-500">Failed to load user data</p>
                    <Button onClick={logout} className="mt-4">
                        Retry
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <AccountSettings user={user} settings={settings} />
    );
};

export default SettingsPage;