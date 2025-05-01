import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import ApplicationsPage from '@/pages/ApplicationsPage';
import ApplicationForm from '@/pages/ApplicationForm';
import ApplicationView from '@/pages/ApplicationFormView';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { toast } from 'sonner';
import applicationApi from '@/api/applicationsApi';

// 🔥 vi.mock applicationApi
vi.mock('@/api/applicationsApi', async () => {
    const mod = await vi.importActual('@/api/applicationsApi');
    return {
        ...mod,
        default: {
            list: vi.fn(() => Promise.resolve([])),
            get: vi.fn(() => Promise.resolve({})),
            create: vi.fn(() => Promise.resolve({})),
            update: vi.fn(() => Promise.resolve({})),
            delete: vi.fn(() => Promise.resolve(true)),
        },
    };
});

// 🔥 Mock toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// 🔥 Mock router
const navigateMock = vi.fn();

// Must mock BEFORE importing ApplicationForm !!
vi.mock('react-router-dom', async () => {
    const mod = await vi.importActual('react-router-dom');
    return {
        ...mod,
        useNavigate: vi.fn(() => navigateMock),
        useParams: vi.fn(),
    };
});

// Clear everything before each test
beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
});


// ----------------------
// ApplicationsPage Tests
// ----------------------
describe('ApplicationsPage', () => {
    test('redirects to login if not authenticated', async () => {
        sessionStorage.setItem('isAuthenticated', 'false');
        render(<BrowserRouter><ApplicationsPage /></BrowserRouter>);
        await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
    });

    test('shows empty state message when no applications', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        render(<BrowserRouter><ApplicationsPage /></BrowserRouter>);
        expect(await screen.findByText(/no applications found/i)).toBeInTheDocument();
    });

    test('loads dummy applications in decoy mode', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('is_decoy_login', 'true');
        render(<BrowserRouter><ApplicationsPage /></BrowserRouter>);
        expect(await screen.findByText(/full stack engineer/i)).toBeInTheDocument();
    });

    test('clicking Add Job Application button navigates', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        render(<BrowserRouter><ApplicationsPage /></BrowserRouter>);
        fireEvent.click(await screen.findByRole('button', { name: /add job application/i }));
        expect(navigateMock).toHaveBeenCalledWith('/applications/new');
    });

    test('can search applications', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('is_decoy_login', 'true');
        render(<BrowserRouter><ApplicationsPage /></BrowserRouter>);

        const searchInput = await screen.findByPlaceholderText(/search applications/i);
        fireEvent.change(searchInput, { target: { value: 'Frontend' } });

        await waitFor(() => {
            expect(screen.getByText(/frontend developer/i)).toBeInTheDocument();
        });
    });

    test('sort buttons work', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('is_decoy_login', 'true');
        render(<BrowserRouter><ApplicationsPage /></BrowserRouter>);
        fireEvent.click(await screen.findByText(/company/i));
        fireEvent.click(await screen.findByText(/position/i));
    });

    test('clicking trash button navigates', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        render(<BrowserRouter><ApplicationsPage /></BrowserRouter>);
        fireEvent.click(await screen.findByRole('button', { name: /trash/i }));
        expect(navigateMock).toHaveBeenCalledWith('/trash');
    });
});

// ----------------------
// ApplicationForm Tests
// ----------------------
describe('ApplicationForm', () => {
    test('renders form fields', () => {
        vi.mocked(useParams).mockReturnValue({}); // Create mode

        render(<BrowserRouter><ApplicationForm /></BrowserRouter>);
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/position title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/application date/i)).toBeInTheDocument();
    });

    test('shows validation errors when submitting empty', async () => {
        vi.mocked(useParams).mockReturnValue({}); // Create mode

        render(<BrowserRouter><ApplicationForm /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText(/job posting url/i), { target: { value: 'https://test.com' } });
        fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'London' } });
        fireEvent.change(screen.getByLabelText(/salary/i), { target: { value: '100-200' } });
        fireEvent.change(screen.getByLabelText(/job description/i), { target: { value: 'Test description' } });

        const submitButton = screen.getByRole('button', { name: /add application/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/position is required/i)).toBeInTheDocument();
        });
    });
});

// ----------------------
// ApplicationView Tests
// ----------------------
describe('ApplicationView', () => {
    test('loads and displays application data', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        vi.mocked(useParams).mockReturnValue({ id: '123' }); // View Mode

        applicationApi.get.mockResolvedValueOnce({
            job_title: 'Frontend Developer',
            company: 'CompanyX',
            status: 'applied',
            applied_date: '2025-04-01',
        });

        render(<BrowserRouter><ApplicationView /></BrowserRouter>);

        expect(await screen.findByText(/frontend developer/i)).toBeInTheDocument();
        expect(await screen.findByText(/companyx/i)).toBeInTheDocument();
    });

    test('shows error and navigates back if loading fails', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        vi.mocked(useParams).mockReturnValue({ id: '123' }); // View Mode

        applicationApi.get.mockRejectedValueOnce(new Error('Fetch failed'));

        render(<BrowserRouter><ApplicationView /></BrowserRouter>);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
            expect(navigateMock).toHaveBeenCalledWith('/applications', { replace: true });
        });
    });
});
