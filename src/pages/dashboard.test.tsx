// src/pages/Dashboard.test.tsx

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { toast } from 'sonner';

vi.mock('@/api/authApi', () => ({
    authApi: {
        isAuthenticated: vi.fn(() => true),
        getStoredUser: vi.fn(() => ({ username: 'TestUser' }))
    }
}));

vi.mock('@/api/applicationsApi', () => ({
    applicationApi: {
        list: vi.fn(() => Promise.resolve([]))
    }
}));

vi.mock('@/api/passwordApi', () => ({
    default: {
        list: vi.fn(() => Promise.resolve([]))
    }
}));

vi.mock('@/api/billsApi', () => ({
    default: {
        list: vi.fn(() => Promise.resolve([]))
    }
}));

vi.mock('@/api/documentsApi', () => ({
    default: {
        list: vi.fn(() => Promise.resolve([]))
    }
}));

const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...mod,
        useNavigate: () => navigateMock,
    };
});

const successToastSpy = vi.spyOn(toast, 'success');
const errorToastSpy = vi.spyOn(toast, 'error');

Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn()
    }
});

describe('Dashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    test('directs to login if not authenticated', async () => {
        const { authApi } = await import('@/api/authApi');
        authApi.isAuthenticated.mockReturnValueOnce(false);

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/login');
        });
    });

    test('loads decoy mode if sessionStorage says so', async () => {
        sessionStorage.setItem('is_decoy_login', 'true');

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        await screen.findAllByText('Job Applications');

        // Decoy apps are rendered
        const applications = screen.getAllByText('Frontend Developer');
        expect(applications.length).toBeGreaterThan(0);
    });

    test('renders welcome message with username', async () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(await screen.findByText(/welcome back, testuser/i)).toBeInTheDocument();
    });
    test('renders smart reminders section', async () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(await screen.findByText(/smart reminders/i)).toBeInTheDocument();
    });
    test('loads real data in normal mode', async () => {
        const { applicationApi } = await import('@/api/applicationsApi');
        const { default: passwordsApi } = await import('@/api/passwordApi');
        const { default: billsApi } = await import('@/api/billsApi');
        const { default: documentsApi } = await import('@/api/documentsApi');

        applicationApi.list.mockResolvedValueOnce([
            { id: '1', company: 'Test Company', job_title: 'Developer', status: 'applied', applied_date: new Date().toISOString() }
        ]);
        passwordsApi.list.mockResolvedValueOnce([
            { id: '1', name: 'Email', username: 'test@example.com', password_value: 'Password123', website_url: '' }
        ]);
        billsApi.list.mockResolvedValueOnce([]);
        documentsApi.list.mockResolvedValueOnce([]);

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        expect(await screen.findByText('Developer')).toBeInTheDocument();
    });
    test('clicking Add Job Application navigates to /applications/new', async () => {
        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        // Get *all* buttons named "Add Job Application"
        const addButtons = await screen.findAllByRole('button', { name: /add job application/i });

        // Click the first one (the top button)
        fireEvent.click(addButtons[0]);

        expect(navigateMock).toHaveBeenCalledWith('/applications/new');
    });


    test('fallbacks to decoy on API error', async () => {
        const { applicationApi } = await import('@/api/applicationsApi');
        applicationApi.list.mockRejectedValueOnce(new Error('API error'));

        render(
            <BrowserRouter>
                <Dashboard />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(errorToastSpy).toHaveBeenCalledWith('Failed to load dashboard data');
        });

        expect(await screen.findByText('Frontend Developer')).toBeInTheDocument();
    });
});
