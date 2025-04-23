import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import ProfileSettings from './ProfileSettings';
import PasswordSettings from './PasswordSettings';
import Notifications from './Notifications';
import DeviceHistory from './DeviceHistory';
import DecoyMode from './DecoyMode';
import AIFeatures from './AIFeatures';
import DangerZone from './DangerZone';
import { User, Settings, Bell, Lock, Shield, Cpu } from 'lucide-react';

const AccountSettings = ({ user, settings }) => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        {
            id: 'profile',
            label: 'Profile',
            icon: <User className="h-4 w-4" />,
            component: <ProfileSettings user={user} />
        },
        {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell className="h-4 w-4" />,
            component: <Notifications settings={settings} />
        },
        {
            id: 'security',
            label: 'Security',
            icon: <Lock className="h-4 w-4" />,
            component: (
                <>
                    <DeviceHistory />
                </>
            )
        }
    ];

    return (
        <PageContainer>
            <div className="app-container py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your account security.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="glass-card p-6 sticky top-24">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium dark:text-white">{user.username}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-left transition-colors ${activeTab === tab.id
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'hover:bg-muted/50 text-muted-foreground'
                                            } ${tab.className || ''}`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {tabs.find(tab => tab.id === activeTab)?.component}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AccountSettings;