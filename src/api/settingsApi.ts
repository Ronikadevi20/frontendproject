// settingsApi.ts
import api from "./client";
import { handleApiError } from "./client";

export interface UserSettings {
    id: number;
    theme: 'light' | 'dark' | 'system';
    enable_notifications: boolean;
    enable_email_alerts: boolean;
    default_job_app_view: 'list' | 'kanban' | 'calendar';
    encrypt_passwords: boolean;
    auto_logout_minutes: number;
}

export interface UserSettingsUpdateDTO {
    theme?: 'light' | 'dark' | 'system';
    enable_notifications?: boolean;
    enable_email_alerts?: boolean;
    default_job_app_view?: 'list' | 'kanban' | 'calendar';
    encrypt_passwords?: boolean;
    auto_logout_minutes?: number;
}

export const settingsApi = {
    /**
     * Get current user's settings
     */
    getSettings: async (): Promise<UserSettings | null> => {
        try {
            const response = await api.get<UserSettings>("/api/settings/");
            if (response.error) {
                handleApiError(response.error, "Failed to fetch user settings");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to fetch user settings");
            return null;
        }
    },

    /**
     * Update current user's settings
     */
    updateSettings: async (data: UserSettingsUpdateDTO): Promise<UserSettings | null> => {
        try {
            const response = await api.patch<UserSettings>("/api/settings/", data);
            if (response.error) {
                handleApiError(response.error, "Failed to update user settings");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to update user settings");
            return null;
        }
    },

    /**
     * Reset settings to default values
     */
    resetSettings: async (): Promise<UserSettings | null> => {
        try {
            const response = await api.post<UserSettings>("/api/settings/reset/", {});
            if (response.error) {
                handleApiError(response.error, "Failed to reset user settings");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to reset user settings");
            return null;
        }
    }
};

export default settingsApi;