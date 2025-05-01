import api from "./client";
import { ApiError } from "@/types/api";

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignupData extends UserCredentials {
  username: string;
  password2: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  decoy?: boolean; // Added decoy flag to user interface
}

export interface AuthResponse {
  user: User;
  refresh: string;
  access: string;
  decoy?: boolean; // Added decoy flag to auth response
}

export interface OtpVerificationData {
  email: string;
  otp_code: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmation {
  email: string;
  code: string;
  newPassword: string;
}

export interface DecoyPasswordData {
  decoy_password: string;
}

export const authApi = {
  // Register a new user
  signup: (data: SignupData) =>
    api.post<{ message: string, email: string }>(
      `${import.meta.env.VITE_API_URL}/auth/register`,
      data,
      false
    ),

  // Verify the OTP code sent after signup
  verifySignupOtp: (data: OtpVerificationData) =>
    api.post<AuthResponse>("/api/auth/verify-otp", data, false),

  // Login with email and password
  login: (credentials: UserCredentials) =>
    api.post<AuthResponse | { message: string, email: string, requires_otp: boolean }>("/api/auth/login", credentials, false),

  // Verify the OTP code sent after login attempt
  verifyLoginOtp: (data: OtpVerificationData) =>
    api.post<AuthResponse>("/api/auth/verify-login-otp", data, false),

  // verify account
  verifyAccount: (data: OtpVerificationData) =>
    api.post<{ otp_code: string, email: string }>("/api/auth/verify-account", data, false),

  // Request a password reset
  requestPasswordReset: (data: PasswordResetRequest) =>
    api.post<{ message: string, email: string }>("/api/auth/request-password-reset", data, false),

  // Confirm and complete the password reset
  confirmPasswordReset: (data: PasswordResetConfirmation) =>
    api.post<{ message: string }>("/api/auth/change-password", data), // ✅ default = true (authenticated)


  // Set decoy password
  setDecoyPassword: (data: DecoyPasswordData) =>
    api.post<{ message: string }>("/api/auth/set-decoy-password", data),

  // Get the current user profile
  getCurrentUser: () =>
    api.get<User>("/api/auth/me"),

  // Logout the current user
  logout: () =>
    api.post<{ message: string }>("/api/auth/logout", {}),

  // Helper to handle the authentication response
  handleAuthResponse: (response: { data: AuthResponse | null, error: string | null }): User | null => {
    if (response.error || !response.data) {
      return null;
    }

    // Store the authentication token and user data
    sessionStorage.setItem("auth_token", response.data.access);
    sessionStorage.setItem("refresh_token", response.data.refresh);

    // Store user data with decoy flag if present
    const userData = {
      ...response.data.user,
      decoy: response.data.decoy || false
    };
    sessionStorage.setItem("user", JSON.stringify(userData));
    sessionStorage.setItem("isAuthenticated", "true");

    // Store decoy flag separately for easy access
    if (response.data.decoy) {
      sessionStorage.setItem("is_decoy_login", "true");
    } else {
      sessionStorage.removeItem("is_decoy_login");
    }

    return userData;
  },

  // Helper to check if the user is authenticated
  isAuthenticated: (): boolean => {
    return sessionStorage.getItem("isAuthenticated") === "true" &&
      !!sessionStorage.getItem("auth_token");
  },

  // Helper to check if the current session is a decoy login
  isDecoyLogin: (): boolean => {
    return sessionStorage.getItem("is_decoy_login") === "true";
  },

  // Helper to get the current authenticated user from sessionStorage
  getStoredUser: (): User | null => {
    const userJson = sessionStorage.getItem("user");
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch (e) {
      return null;
    }
  },

  sendEmail: async (subject: string, message: string, recipients: string[]): Promise<ApiError | null> => {
    try {
      const response = await api.post<ApiError>("/api/auth/send-email", {
        subject,
        message,
        recipients
      }, false);
      if (response.error) {
        return response.error;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // Clear authentication data on logout
  clearAuth: (): void => {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("is_decoy_login");
  }
};

export default authApi;