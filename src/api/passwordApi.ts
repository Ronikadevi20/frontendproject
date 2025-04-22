// passwordsApi.ts
import api from "./client";
import { handleApiError } from "./client";

export interface PasswordEntry {
    id: string;
    name: string;
    username?: string;
    password_value: string;
    website_url?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface PasswordCreateDTO {
    name: string;
    username?: string;
    password_value: string;
    website_url?: string;
    notes?: string;
}


export interface PasswordEntry {
    id: string;
    name: string;
    username?: string;
    password_value: string;
    website_url?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    category?: string;  // Added category to match backend
}

export interface PasswordCreateDTO {
    name: string;
    username?: string;
    password_value: string;
    website_url?: string;
    notes?: string;
}

export interface PasswordUpdateDTO extends Partial<PasswordCreateDTO> { }

export interface SharedPasswordResponse {
    token: string;
    share_url: string;
    expires_at: string;
    viewed: boolean;
}

export interface SharePasswordDTO {
    hours: number;
}


export interface PasswordUpdateDTO extends Partial<PasswordCreateDTO> { }

export const passwordsApi = {
    /**
     * Get all passwords for the current user
     */
    list: async (): Promise<PasswordEntry[]> => {
        try {
            const response = await api.get<PasswordEntry[]>("/api/passwords/");
            if (response.error) {
                handleApiError(response.error, "Failed to fetch passwords");
                return [];
            }
            return response.data || [];
        } catch (error) {
            handleApiError(error, "Failed to fetch passwords");
            return error;
        }
    },

    /**
     * Create a new password entry
     */
    create: async (data: PasswordCreateDTO): Promise<PasswordEntry | null> => {
        console.log("Creating password with data:", data);
        try {
            const response = await api.post<PasswordEntry>("/api/passwords/", data);
            if (response.error) {
                handleApiError(response.error, "Failed to create password");
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to create password");
            return error;
        }
    },

    /**
     * Get a single password by ID
     */
    get: async (id: string): Promise<PasswordEntry | null> => {
        try {
            const response = await api.get<PasswordEntry>(`/api/passwords/${id}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to fetch password");
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to fetch password");
            return error;
        }
    },

    /**
     * Update a password (full update)
     */
    update: async (id: string, data: PasswordCreateDTO): Promise<PasswordEntry | null> => {
        try {
            const response = await api.put<PasswordEntry>(`/api/passwords/${id}/`, data);
            if (response.error) {
                handleApiError(response.error, "Failed to update password");
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to update password");
            return error;
        }
    },

    /**
     * Partial update a password
     */
    partialUpdate: async (id: string, data: PasswordUpdateDTO): Promise<PasswordEntry | null> => {
        try {
            const response = await api.put<PasswordEntry>(`/api/passwords/${id}/`, data);
            if (response.error) {
                handleApiError(response.error, "Failed to update password");
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to update password");
            return error;
        }
    },

    /**
     * Delete a password
     */
    delete: async (id: string): Promise<boolean> => {
        try {
            const response = await api.delete<null>(`/api/passwords/${id}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to delete password");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to delete password");
            return false;
        }
    },
    share: async (id: string, data: SharePasswordDTO): Promise<SharedPasswordResponse | null> => {
        try {
            const response = await api.post<SharedPasswordResponse>(
                `/api/passwords/${id}/share/`,
                {
                    hours: data.hours,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                }
            );

            return response.data ?? null;
        } catch (error) {
            handleApiError(error, "Failed to share password");
            return null;
        }
    },


    /**
     * Get shared password details (for tracking shares)
     * @param token Shared password token
     */
    getShared: async (token: string): Promise<SharedPasswordResponse | null> => {
        try {
            const response = await api.get<SharedPasswordResponse>(
                `/api/passwords/shared/${token}/`
            );

            if (response.error) {
                handleApiError(response.error, "Failed to fetch shared password");
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to fetch shared password");
            return error;
        }
    },

    /**
     * Revoke a shared password link
     * @param token Shared password token
     */
    revokeShare: async (token: string): Promise<boolean> => {
        try {
            const response = await api.delete(`/api/passwords/shared/${token}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to revoke share");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to revoke share");
            return false;
        }
    }
};

export default passwordsApi;