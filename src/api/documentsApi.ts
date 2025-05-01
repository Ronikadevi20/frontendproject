// documentsApi.ts
import api from "./client";
import { handleApiError } from "./client";

export type ExpiryStatus = 'active' | 'expired' | 'expiring_soon';

export interface DocumentEntry {
  id: string;
  title: string;
  description?: string;
  file: string; // URL to the file
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at?: string;
  expiry_date?: string;
  is_expired: boolean;
  expires_soon: boolean;
  is_deleted: boolean;
  deleted_at?: string;
}

export interface DocumentCreateDTO {
  title: string;
  description?: string;
  expiry_date?: string;
  file: File;
}

export interface DocumentUpdateDTO {
  title?: string;
  description?: string | null; // Allow clearing description
  expiry_date?: string | null; // Allow clearing expiry date
}

export interface DocumentStats {
  total_documents: number;
  active_documents: number;
  expired_documents: number;
  expiring_soon: number;
  storage_used: number; // in bytes
}

export const documentsApi = {
  /**
   * Get all documents for the current user
   * @param params Optional filters and pagination
   */
  list: async (params?: {
    includeDeleted?: boolean;
    expiryStatus?: ExpiryStatus;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<DocumentEntry[]> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.includeDeleted) queryParams.append('show_deleted', 'true');
      if (params?.expiryStatus) queryParams.append('expiry_status', params.expiryStatus);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());

      const response = await api.get<DocumentEntry[]>(`/api/documents/?${queryParams.toString()}`);
      return response.data ?? [];
    } catch (error) {
      handleApiError(error, "Failed to fetch documents");
      return [];
    }
  },

  /**
   * Upload a new document
   */
  create: async (data: DocumentCreateDTO): Promise<DocumentEntry> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('file', data.file);

      if (data.description) formData.append('description', data.description);
      if (data.expiry_date) formData.append('expiry_date', data.expiry_date);

      const response = await api.upload<DocumentEntry>("/api/documents/", formData);
      if (!response.data) throw new Error("No data returned");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to upload document");
      throw error; // Re-throw to allow handling in the component
    }
  },

  /**
   * Get a single document by ID
   */
  get: async (id: string): Promise<DocumentEntry> => {
    try {
      const response = await api.get<DocumentEntry>(`/api/documents/${id}/`);
      if (!response.data) throw new Error("Document not found");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch document");
      throw error;
    }
  },

  /**
   * Update document metadata
   */
  update: async (id: string, data: DocumentUpdateDTO): Promise<DocumentEntry> => {
    try {
      const response = await api.patch<DocumentEntry>(`/api/documents/${id}/`, data);
      if (!response.data) throw new Error("Update failed");
      return response.data;
    } catch (error) {
      console.log(error)
      throw error;
    }
  },

  /**
   * Delete a document (soft delete)
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/documents/${id}/`);
    } catch (error) {
      handleApiError(error, "Failed to delete document");
      throw error;
    }
  },

  /**
   * Restore a soft-deleted document
   */
  restore: async (id: string): Promise<DocumentEntry> => {
    try {
      const response = await api.post<DocumentEntry>(`/api/documents/${id}/restore/`);
      if (!response.data) throw new Error("Restore failed");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to restore document");
      throw error;
    }
  },

  /**
   * Download a document file
   */
  download: async (id: string): Promise<Blob> => {
    try {
      const response = await api.get<Blob>(`/api/documents/${id}/download/`, {
        responseType: 'blob'
      });
      if (!response.data) throw new Error("No file data received");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to download document");
      throw error;
    }
  },

  /**
   * Get document statistics
   */
  stats: async (): Promise<DocumentStats> => {
    try {
      const response = await api.get<DocumentStats>("/api/documents/stats/");
      if (!response.data) throw new Error("No stats data received");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to get document stats");
      throw error;
    }
  },

  /**
   * Permanently delete a document (hard delete)
   * Note: Only available for admin or specific roles in backend
   */
  permanentDelete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/documents/${id}/permanent/`);
    } catch (error) {
      handleApiError(error, "Failed to permanently delete document");
      throw error;
    }
  }
};

export default documentsApi;