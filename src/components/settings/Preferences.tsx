import { useEffect, useState } from 'react';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { SelectTrigger, SelectContent, SelectItem } from '../ui/select';
import { SelectValue } from '../ui/select';

const Preferences = ({ settings }) => {
    const [currentTheme, setCurrentTheme] = useState(settings.theme);

    useEffect(() => {
        // Apply theme when component mounts or theme changes
        applyTheme(currentTheme);
    }, [currentTheme]);

    const applyTheme = (theme) => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else if (theme === 'light') {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        } else {
            // System preference
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                root.classList.add('dark');
                root.style.colorScheme = 'dark';
            } else {
                root.classList.remove('dark');
                root.style.colorScheme = 'light';
            }
        }
    };

    const handleThemeChange = (theme) => {
        setCurrentTheme(theme);
        // Optional: Save to localStorage or backend
        localStorage.setItem('theme', theme);
    };

    return (
        <section className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-6">App Preferences</h2>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={currentTheme} onValueChange={handleThemeChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </section>
    );
};

export default Preferences;