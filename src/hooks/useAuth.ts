import { useState, useEffect } from 'react';
import { authApi, User } from '@/api/authApi';
import userApi from '@/api/userApi';
import { toast } from 'sonner';

const useAuth = () => {
    const [user, setUser] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            if (authApi.isAuthenticated()) {
                const storedUser = authApi.getStoredUser();
                setUser(storedUser);
            }
            console.log(user);
            setIsLoading(false);
        };

        loadUser();
    }, []);

    const updateUser = (updatedUser: any) => {
        try {
            userApi.updateUserProfile(updatedUser).then(() => {
                setUser(updatedUser);
                toast.success('User profile updated successfully!');
            }).catch((error) => {
                toast.error('Failed to update user profile');
            });
        } catch (error) {
            console.error('Failed to update user profile:', error);
        }
    };


    const logout = () => {
        authApi.clearAuth();
        setUser(null);
    };

    return { user, isLoading, logout, updateUser };
};

export default useAuth;