
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  url: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
}

export interface VerificationResponse {
  message: string;
  success: boolean;
}

export interface PasswordCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paymentDate?: string;
  category: string;
  notes?: string;
}
