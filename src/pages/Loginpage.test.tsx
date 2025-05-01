import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import axios from 'axios';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { toast } from 'sonner';

vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const errorToastSpy = vi.spyOn(toast, 'error');
const successToastSpy = vi.spyOn(toast, 'success');
describe('LoginPage', () => {


    beforeEach(() => {
        window.sessionStorage.clear();
    });

    test('renders email and password fields', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    test('shows validation errors when fields are empty', async () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });

    test('successful login redirects to dashboard', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                access: 'fake_access_token',
                refresh: 'fake_refresh_token',
                user: {
                    id: '1',
                    username: 'testuser',
                    email: 'test@example.com',
                    createdAt: '2023-01-01',
                    lastLoginAt: '2023-01-02',
                },
            }
        });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(sessionStorage.getItem('auth_token')).toBe('fake_access_token');
        });
    });

    test('shows OTP screen if login requires OTP', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                requires_otp: true,
            }
        });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        expect(await screen.findByText(/We've sent a 6-digit verification code/i)).toBeInTheDocument();
    });

    test('shows error message on invalid credentials', async () => {
        mockedAxios.post.mockRejectedValueOnce({
            response: {
                status: 401,
                data: { error: 'Invalid credentials' },
            }
        });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        await waitFor(() => {
            expect(errorToastSpy).toHaveBeenCalledWith('Invalid email or password. Please try again.');
        });
    });
    test('resends OTP code successfully', async () => {
        // Simulate API for resend OTP
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                requires_otp: true,
            }
        });
        mockedAxios.post.mockResolvedValueOnce({
            data: {}, // Second call for resend
        });

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        // Simulate successful login leading to OTP screen
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        // Wait for OTP screen
        await screen.findByText(/we've sent a 6-digit verification code/i);

        // Click "Resend Code" button
        fireEvent.click(screen.getByRole('button', { name: /resend code/i }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Verification code resent. Please check your email.');
        });
    });
    // test('shows validation error for invalid email format', async () => {
    //     render(
    //         <BrowserRouter>
    //             <LoginPage />
    //         </BrowserRouter>
    //     );

    //     fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'invalidemail' } }); // no @ symbol
    //     fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    //     fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    //     expect(await screen.findByText(/Email is invalid/i)).toBeInTheDocument();
    // });
});
