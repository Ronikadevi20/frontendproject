import { User, KeyRound, Palette, Bell, Shield, CpuIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SettingsLayout = ({
    user,
    activeTab,
    setActiveTab,
    children,
}: {
    user: { username: string; email: string };
    activeTab: string;
    setActiveTab: (tab: string) => void;
    children: React.ReactNode;
}) => {
    const tabs = [
        { id: 'profile', icon: User, label: 'Profile' },
        { id: 'password', icon: KeyRound, label: 'Password' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'security', icon: Shield, label: 'Security' },
        { id: 'ai', icon: CpuIcon, label: 'AI Settings' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-24">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium">{user.username}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-3 py-2 rounded-md text-left ${activeTab === tab.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted/50'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-6 pt-6 border-t">
                        <Button
                            variant="outline"
                            className="w-full justify-center text-red-600 hover:bg-red-50"
                            onClick={() => {
                                authApi.clearAuth();
                                navigate('/login');
                                toast.success('Logged out successfully');
                            }}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </aside>

            <div className="lg:col-span-3 space-y-8">
                {children}
            </div>
        </div>
    );
};