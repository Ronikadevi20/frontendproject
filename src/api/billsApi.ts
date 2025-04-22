// billsApi.ts
import api from "./client";
import { handleApiError } from "./client";

export interface BillEntry {
    url: string;
    id: string;
    name: string;
    amount: string;
    due_date: string;
    is_paid: boolean;
    payment_date?: string;
    category: string;
    notes?: string;
    website_url?: string;
    username?: string;
    password_value?: string;
    created_at: string;
    updated_at: string;
    receipt?: string; // URL to the receipt file
}

export interface BillCreateDTO {
    name: string;
    amount: string;
    due_date: string;
    is_paid?: boolean;
    payment_date?: string;
    category?: string;
    notes?: string;
    website_url?: string;
    username?: string;
    password_value?: string;
    receipt?: File | string | null; // File for upload, string for existing URL, or null to remove
}

export interface BillUpdateDTO extends Partial<BillCreateDTO> { }

export const billsApi = {
    /**
     * Get all bills for the current user
     */
    list: async (): Promise<BillEntry[]> => {
        try {
            const response = await api.get<BillEntry[]>("/api/bills/");
            if (response.error) {
                handleApiError(response.error, "Failed to fetch bills");
                return [];
            }
            return response.data || [];
        } catch (error) {
            handleApiError(error, "Failed to fetch bills");
            return [];
        }
    },

    /**
     * Create a new bill
     */
    create: async (data: BillCreateDTO): Promise<BillEntry | null> => {
        try {
            // Check if we need to handle file upload
            if (data.receipt instanceof File) {
                const formData = new FormData();

                // Add all text fields to formData
                Object.entries(data).forEach(([key, value]) => {
                    if (key !== 'receipt') {
                        // Handle special cases for JSON serialization
                        if (value === undefined) {
                            // Skip undefined values
                            return;
                        } else if (value === null) {
                            formData.append(key, '');
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                });

                // Add the file
                formData.append('receipt', data.receipt);

                const response = await api.post<BillEntry>("/api/bills/", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.error) {
                    return response;
                }
                return response.data;
            } else {
                // No file upload, use regular JSON
                const response = await api.post<BillEntry>("/api/bills/", data);
                if (response.error) {
                    return response;
                }
                return response.data;
            }
        } catch (error) {
            console.error("Create bill error:", error);
            return { error: "Failed to create bill" } as any;
        }
    },

    /**
     * Get a single bill by ID
     */
    get: async (id: string): Promise<BillEntry | null> => {
        try {
            const response = await api.get<BillEntry>(`/api/bills/${id}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to fetch bill");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to fetch bill");
            return null;
        }
    },

    /**
     * Update a bill (full update)
     */
    update: async (id: string, data: BillCreateDTO): Promise<BillEntry | null> => {
        try {
            // Check if we need to handle file upload
            if (data.receipt instanceof File) {
                const formData = new FormData();

                // Add all text fields to formData
                Object.entries(data).forEach(([key, value]) => {
                    if (key !== 'receipt') {
                        // Handle special cases for JSON serialization
                        if (value === undefined) {
                            // Skip undefined values
                            return;
                        } else if (value === null) {
                            formData.append(key, '');
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                });

                // Add the file
                formData.append('receipt', data.receipt);

                const response = await api.put<BillEntry>(`/api/bills/${id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.error) {
                    handleApiError(response.error, "Failed to update bill");
                    return null;
                }
                return response.data;
            } else {
                // No file upload, use regular JSON
                const response = await api.put<BillEntry>(`/api/bills/${id}/`, data);
                if (response.error) {
                    handleApiError(response.error, "Failed to update bill");
                    return null;
                }
                return response.data;
            }
        } catch (error) {
            handleApiError(error, "Failed to update bill");
            return null;
        }
    },

    /**
     * Partial update a bill
     */
    partialUpdate: async (id: string, data: BillUpdateDTO): Promise<BillEntry | null> => {
        try {
            // Check if we need to handle file upload
            if (data.receipt instanceof File) {
                const formData = new FormData();

                // Add all text fields to formData
                Object.entries(data).forEach(([key, value]) => {
                    if (key !== 'receipt') {
                        // Handle special cases for JSON serialization
                        if (value === undefined) {
                            // Skip undefined values
                            return;
                        } else if (value === null) {
                            formData.append(key, '');
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                });

                // Add the file
                formData.append('receipt', data.receipt);

                const response = await api.patch<BillEntry>(`/api/bills/${id}/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.error) {
                    handleApiError(response.error, "Failed to update bill");
                    return null;
                }
                return response.data;
            } else {
                // No file upload, use regular JSON
                const response = await api.patch<BillEntry>(`/api/bills/${id}/`, data);
                if (response.error) {
                    handleApiError(response.error, "Failed to update bill");
                    return null;
                }
                return response.data;
            }
        } catch (error) {
            handleApiError(error, "Failed to update bill");
            return null;
        }
    },

    /**
     * Delete a bill
     */
    delete: async (id: string): Promise<boolean> => {
        try {
            const response = await api.delete(`/api/bills/${id}/`);
            if (response.error) {
                handleApiError(response.error, "Failed to delete bill");
                return false;
            }
            return true;
        } catch (error) {
            handleApiError(error, "Failed to delete bill");
            return false;
        }
    },

    /**
     * Toggle bill payment status
     */
    togglePaymentStatus: async (id: string, isPaid: boolean): Promise<BillEntry | null> => {
        try {
            const response = await api.patch<BillEntry>(`/api/bills/${id}/`, {
                is_paid: isPaid,
                payment_date: isPaid ? new Date().toISOString().split('T')[0] : null
            });
            if (response.error) {
                handleApiError(response.error, "Failed to update payment status");
                return null;
            }
            return response.data;
        } catch (error) {
            handleApiError(error, "Failed to update payment status");
            return null;
        }
    }
};

export default billsApi;