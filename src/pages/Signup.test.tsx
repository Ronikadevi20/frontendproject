import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignupPage from '@/pages/SignupPage';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { authApi } from '@/api/authApi';

// Mocks
vi.mock('@/api/authApi', () => ({
    authApi: {
        signup: vi.fn(),
        verifySignupOtp: vi.fn(),
    }
}));

const errorToastSpy = vi.spyOn(toast, 'error');
const successToastSpy = vi.spyOn(toast, 'success');

describe('SignupPage', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
        vi.clearAllMocks();
    });

    test('renders signup fields and button', () => {
        render(
            <BrowserRouter>
                <SignupPage />
            </BrowserRouter>
        );

        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

        const signupButtons = screen.getAllByRole('button', { name: /sign up/i });
        expect(signupButtons.length).toBeGreaterThan(0); // At least one button
    });

    test('shows validation errors when fields are empty', async () => {
        render(
            <BrowserRouter>
                <SignupPage />
            </BrowserRouter>
        );

        fireEvent.submit(screen.getByTestId('signup-form'));

        expect(await screen.findByText(/Username is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Email is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/please confirm your password/i)).toBeInTheDocument();
    });

    test('shows validation error for invalid email format', async () => {
        render(
            <BrowserRouter>
                <SignupPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'invalidemail' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

        fireEvent.submit(screen.getByTestId('signup-form'));

        expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();
    });

    test('shows validation error for password mismatch', async () => {
        render(
            <BrowserRouter>
                <SignupPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'differentpassword' } });

        fireEvent.submit(screen.getByTestId('signup-form'));

        expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    });

    test('successful signup moves to OTP verification step', async () => {
        (authApi.signup as any).mockResolvedValueOnce({});

        render(
            <BrowserRouter>
                <SignupPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'newuser@example.com' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

        fireEvent.submit(screen.getByTestId('signup-form'));

        await waitFor(() => {
            expect(successToastSpy).toHaveBeenCalledWith('Verification code sent to your email');
        });

        expect(await screen.findByText(/we've sent a 6-digit verification code/i)).toBeInTheDocument();
    });

    test('shows error toast if signup API fails', async () => {
        (authApi.signup as any).mockRejectedValueOnce({
            response: {
                data: {
                    error: 'Invalid data provided.',
                    details: {
                        email: [{ string: 'Invalid data provided.' }]
                    }
                }
            }
        });

        render(
            <BrowserRouter>
                <SignupPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existinguser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'existing@example.com' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

        fireEvent.submit(screen.getByTestId('signup-form'));

        await waitFor(() => {
            expect(errorToastSpy).toHaveBeenCalled();
            expect(errorToastSpy.mock.calls[0][0]).toContain('Invalid data provided.');
        });
    });
});
