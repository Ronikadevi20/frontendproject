
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://7976-102-212-236-189.ngrok-free.app";

interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface ApiResponse<T> {
  message: string;
  data: T | null;
  error: string | null;
  status?: number;
  validationErrors?: any;
}

const getAuthToken = (): string | null => {
  return sessionStorage.getItem("auth_token");
};

const createHeaders = (includeAuth: boolean = true): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

async function apiRequest<T>(
  endpoint: string,
  method: string,
  data?: any,
  includeAuth: boolean = true,
  isFormData: boolean = false
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const options: RequestOptions = {
      method,
      headers: isFormData
        ? includeAuth ? { "Authorization": `Bearer ${getAuthToken()}` } : {}
        : createHeaders(includeAuth),
    };

    if (data) {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const responseText = await response.text(); // Read response as text first

    let responseData;
    try {
      responseData = JSON.parse(responseText); // Attempt to parse as JSON
    } catch {
      responseData = responseText; // If parsing fails, use the text
    }

    if (!response.ok) {
      let errorMessage = "An error occurred";

      // Handle 400 Bad Request specifically
      if (response.status === 400) {
        if (typeof responseData === 'object' && responseData) {
          errorMessage = responseData.detail || responseData.non_field_errors?.join(', ') ||
            Object.entries(responseData).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }

        toast.error(`Validation error: ${errorMessage}`);
      } else if (response.status === 401) {
        toast.error("Unauthorized. Please log in again.");
        sessionStorage.removeItem("auth_token");
        window.location.href = "/login";
      } else {
        errorMessage = typeof responseData === 'object' ? JSON.stringify(responseData) : responseData;
      }

      return {
        message: "",
        data: null,
        error: errorMessage,
        status: response.status,
        validationErrors: typeof responseData === 'object' ? responseData : null,
      };
    }

    return {
      message: "",
      data: responseData,
      error: null,
      status: response.status,
    };
  } catch (error) {
    console.error("API request failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Network request failed";
    toast.error(errorMessage);
    return {
      message: "",
      data: null,
      error: errorMessage,
      status: 0,
    };
  }
}

export const api = {
  get: <T>(endpoint: string, includeAuth: boolean = true) =>
    apiRequest<T>(endpoint, "GET", undefined, includeAuth),

  post: <T>(endpoint: string, data: any, includeAuth: boolean = true) =>
    apiRequest<T>(endpoint, "POST", data, includeAuth),

  put: <T>(endpoint: string, data: any, includeAuth: boolean = true) =>
    apiRequest<T>(endpoint, "PUT", data, includeAuth),

  delete: <T>(endpoint: string, includeAuth: boolean = true) =>
    apiRequest<T>(endpoint, "DELETE", undefined, includeAuth),

  upload: <T>(endpoint: string, formData: FormData, includeAuth: boolean = true) =>
    apiRequest<T>(endpoint, "POST", formData, includeAuth, true),

  patch: <T>(endpoint: string, data: any, includeAuth: boolean = true) =>
    apiRequest<T>(endpoint, "PATCH", data, includeAuth),
};

// Error handler for API responses
export const handleApiError = (error: string | null, fallbackMessage: string = "An error occurred") => {
  const message = error || fallbackMessage;
  toast.error(message);
  return message;
};

export default api;
