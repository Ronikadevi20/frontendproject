// src/pages/bills.test.tsx
import axios from 'axios';
vi.mock('axios');
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { toast } from 'sonner';
import BillEntryForm from '@/pages/BillEntryForm';
import BillView from '@/pages/BillView';
import billsApi from '@/api/billsApi';

// Mock bills API
vi.mock('@/api/billsApi', async () => {
    const mod = await vi.importActual('@/api/billsApi');
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
vi.mock('axios', () => ({
    default: {
        post: vi.fn(() => Promise.resolve({ data: {} })),
        put: vi.fn(() => Promise.resolve({ data: {} })),
    }
}));

// Mock toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
    },
}));

// Mock router
const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
    const mod = await vi.importActual('react-router-dom');
    return {
        ...mod,
        useNavigate: () => navigateMock,
        useParams: vi.fn(),
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
    };
});

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
});

// ------------------------------------
// BillEntryForm Tests
// ------------------------------------
describe('BillEntryForm', () => {
    test('renders form fields', () => {
        vi.mocked(useParams).mockReturnValue({});

        render(<BrowserRouter><BillEntryForm /></BrowserRouter>);
        expect(screen.getByLabelText(/bill name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
        expect(screen.getByText(/due date/i));
    });

    test('shows validation errors when submitting empty', async () => {
        vi.mocked(useParams).mockReturnValue({});

        render(<BrowserRouter><BillEntryForm /></BrowserRouter>);
        fireEvent.click(screen.getByRole('button', { name: /save bill/i }));

        await waitFor(() => {
            expect(screen.getByText(/bill name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/valid amount required/i)).toBeInTheDocument();
        });
    });

    test('successful creation shows success toast', async () => {
        vi.mocked(useParams).mockReturnValue({});
        billsApi.create.mockResolvedValueOnce({ id: 1 });

        render(<BrowserRouter><BillEntryForm /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText(/bill name/i), { target: { value: 'Electricity' } });
        fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
        fireEvent.click(screen.getByRole('button', { name: /save bill/i }));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Bill created successfully');
        });
    });

    test('successful edit shows success toast', async () => {
        vi.mocked(useParams).mockReturnValue({ id: '123' });

        // Mock GET (fetch bill for edit form)
        billsApi.get.mockResolvedValueOnce({
            name: 'Old Bill',
            amount: '100',
            due_date: '2025-04-29',
            is_paid: false,
            category: 'BILLS',
        });

        // Mock UPDATE (save after edit)
        billsApi.update.mockResolvedValueOnce({});

        render(<BrowserRouter><BillEntryForm /></BrowserRouter>);

        // Wait for initial form to load (after get)
        await waitFor(() => {
            expect(screen.getByLabelText(/bill name/i)).toBeInTheDocument();
        });

        // Now fill fields
        fireEvent.change(screen.getByLabelText(/bill name/i), { target: { value: 'Updated Bill' } });
        fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '150' } });

        // Click Save
        fireEvent.click(screen.getByTestId('save-bill'));

        // Expect success
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Bill updated successfully');
        });
    });
    test('file upload error (wrong type)', async () => {
        vi.mocked(useParams).mockReturnValue({});

        render(<BrowserRouter><BillEntryForm /></BrowserRouter>);

        const fileInput = screen.getByLabelText(/click to upload/i);
        const invalidFile = new File(['dummy'], 'dummy.txt', { type: 'text/plain' });

        fireEvent.change(fileInput, { target: { files: [invalidFile] } });

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Please upload an image or PDF file');
        });
    });

    test('shows error toast if API call fails', async () => {
        (axios.post as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

        render(<BrowserRouter><BillEntryForm /></BrowserRouter>);

        // fill minimum fields
        fireEvent.change(screen.getByLabelText(/bill name/i), { target: { value: 'Test Bill' } });
        fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });

        fireEvent.click(screen.getByRole('button', { name: /save bill/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred');
        });
    });
});

// ------------------------------------
// BillView Tests
// ------------------------------------
describe('BillView', () => {
    test('loads and displays bill data', async () => {
        vi.mocked(useParams).mockReturnValue({ id: '123' });

        billsApi.get.mockResolvedValueOnce({
            id: '123',
            name: 'Internet Bill',
            amount: '50',
            due_date: '2025-05-01',
            is_paid: false,
            category: 'UTILITIES',
        });

        render(<BrowserRouter><BillView /></BrowserRouter>);

        expect(await screen.findByText(/internet bill/i)).toBeInTheDocument();
        expect(await screen.findByText(/utilities/i)).toBeInTheDocument();
    });

    test('shows error and navigates back if loading fails', async () => {
        vi.mocked(useParams).mockReturnValue({ id: '123' });

        billsApi.get.mockRejectedValueOnce(new Error('Load error'));

        render(<BrowserRouter><BillView /></BrowserRouter>);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Failed to load bill details');
            expect(navigateMock).toHaveBeenCalledWith('/vault');
        });
    });

    test('marks bill as paid (navigates to edit)', async () => {
        sessionStorage.setItem('isAuthenticated', 'true');
        vi.mocked(useParams).mockReturnValue({ id: '123' });

        billsApi.get.mockResolvedValueOnce({
            id: 123,
            name: 'Water Bill',
            amount: '80.00',
            due_date: '2025-04-30',
            is_paid: false,
            category: 'UTILITIES',
        });

        render(<BrowserRouter><BillView /></BrowserRouter>);

        fireEvent.click(await screen.findByRole('button', { name: /mark as paid/i }));

        await waitFor(() => {
            expect(navigateMock).toHaveBeenCalledWith('/bills/edit/123?markPaid=true');
        });
    });
});
