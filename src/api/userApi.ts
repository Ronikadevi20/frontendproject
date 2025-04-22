import api from "./client";
import { ApiError } from "@/types/api";
import { User } from "./authApi"; // Import User type from authApi

export interface UpdateUserData {
    username?: string;
    email?: string;
}

export const userApi = {
    // Fetch the current user's profile
    getUserProfile: () =>
        api.get<User>("/api/auth/profile"),

    // Update the current user's profile
    updateUserProfile: (data: UpdateUserData) =>
        api.put<{ message: string }>("/api/auth/profile", data),

    // Fetch user settings
    getUserSettings: () =>
        api.get<{ theme: string; notifications: any }>("/api/auth/settings"),

    // Update user settings
    updateUserSettings: (data: any) =>
        api.put<{ message: string }>("/api/auth/settings", data),

    // Delete user account
    deleteUserAccount: () =>
        api.delete<{ message: string }>("/api/auth/account"),

    // Handle errors for API responses
    handleApiError: (error: ApiError) => {
        // Implement error handling logic (e.g., logging, displaying messages)
        console.error("API Error:", error);
    }
};

export default userApi;