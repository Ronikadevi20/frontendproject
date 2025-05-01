// src/pages/ForgotPasswordPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import axios from 'axios';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { toast } from 'sonner';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const successToastSpy = vi.spyOn(toast, 'success');
const errorToastSpy = vi.spyOn(toast, 'error');
vi.mock('@/components/auth/OtpVerification', () => ({
    default: ({ onVerify }: any) => (
        <div>
            <button onClick={() => onVerify('123456')}>Mock Verify</button>
        </div>
    )
}));
describe('ForgotPasswordPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders email field and send button', () => {
        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send reset code/i })).toBeInTheDocument();
    });

    test('shows validation error for invalid email format', async () => {
        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset code/i }));

        await waitFor(() => {
            expect(emailInput.validity.valid).toBe(false);  // HTML5 input invalid
        });
    });
    test('successful email submission moves to OTP screen', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Verification sent' } });

        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset code/i }));

        await waitFor(() => {
            expect(successToastSpy).toHaveBeenCalledWith('Verification code sent to your email');
        });

    });

    test('otp entered moves to reset password step', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Verification sent' } });

        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset code/i }));

        await waitFor(() => {
            expect(successToastSpy).toHaveBeenCalledWith('Verification code sent to your email');
        });

        // Click mock verify button
        fireEvent.click(screen.getByText(/mock verify/i));

        // ✅ Now check Reset Password screen appears
        expect(await screen.findByLabelText(/^new password$/i)).toBeInTheDocument();
        expect(await screen.findByLabelText(/^confirm new password$/i)).toBeInTheDocument();
    });



    test('shows validation errors when resetting with empty fields', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Verification sent' } });

        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset code/i }));

        await waitFor(() => {
            expect(successToastSpy).toHaveBeenCalledWith('Verification code sent to your email');
        });

        fireEvent.click(screen.getByRole('button', { name: /mock verify/i }));

        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

        expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });


    test('shows error toast if password reset API fails', async () => {
        mockedAxios.post
            .mockResolvedValueOnce({ data: { message: 'Verification sent' } })
            .mockRejectedValueOnce(new Error('Reset failed'));

        render(
            <BrowserRouter>
                <ForgotPasswordPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /send reset code/i }));

        await waitFor(() => {
            expect(successToastSpy).toHaveBeenCalledWith('Verification code sent to your email');
        });

        fireEvent.click(screen.getByRole('button', { name: /mock verify/i }));

        fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

        await waitFor(() => {
            expect(errorToastSpy).toHaveBeenCalledWith('Failed to reset password. Please try again.');
        });
    });

});
