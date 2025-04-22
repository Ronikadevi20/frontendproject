// trashApi.ts
import api from "./client";
import { handleApiError } from "./client";

export interface TrashItem {
    id: number;
    name: string;
    type: 'document' | 'bill' | 'application' | 'password';
    deleted_at: string;
    details?: {
        file_type?: string;
        size?: number;
        amount?: string;
        category?: string;
        company?: string;
        job_title?: string;
    };
}

export const trashApi = {
    /**
     * Get all items in trash for the current user
     */
    list: async (): Promise<TrashItem[]> => {
        try {
            const response = await api.get<TrashItem[]>("/api/trash/");
            if (response.error) {
                handleApiError(response.error, "Failed to fetch trash items");
                return [];
            }
            return response.data || [];
        } catch (error) {
            handleApiError(error, "Failed to fetch trash items");
            return [];
        }
    },

    /**
     * Restore an item from trash
     */
    restore: async (id: number, type: string): Promise<boolean> => {
        try {
            const response = await api.post("/api/trash/restore/", {
                id,
                type
            });
            if (response.error) {
                handleApiError(response.error, "Failed to restore item");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to restore item");
            return false;
        }
    },

    /**
     * Permanently delete an item from trash
     */
    permanentDelete: async (id: number, type: string): Promise<boolean> => {
        try {
            const response = await api.delete(`/api/trash/permanently/${id}/${type}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to permanently delete item");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to permanently delete item");
            return false;
        }
    },

    /**
     * Empty trash (permanently delete all items)
     */
    emptyTrash: async (): Promise<boolean> => {
        try {
            const response = await api.delete("/api/trash/empty/");
            if (response.error) {
                handleApiError(response.error, "Failed to empty trash");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to empty trash");
            return false;
        }
    }
};

export default trashApi;