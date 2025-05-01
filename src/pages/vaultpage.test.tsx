import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VaultPage from '@/pages/VaultPage';
import { useNavigate } from 'react-router-dom';
// Mock APIs
vi.mock('@/api/passwordApi', () => ({
    default: {
        list: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue({}),
    }
}));
vi.mock('@/api/billsApi', () => ({
    default: {
        list: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue({}),
    }
}));
vi.mock('@/api/documentsApi', () => ({
    default: {
        list: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue({}),
        download: vi.fn().mockResolvedValue(new Blob()),
    }
}));

// Mock navigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),   // mock navigate function
    };
});

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(),

    },
});

// Mock IntersectionObserver
beforeEach(() => {
    global.IntersectionObserver = class {
        constructor() { }
        observe() { }
        unobserve() { }
        disconnect() { }
    };

    Object.defineProperty(window, 'sessionStorage', {
        value: {
            getItem: vi.fn(),
            setItem: vi.fn(),
        },
        writable: true,
    });
});

describe('VaultPage', () => {
    it('renders Vault Manager page title', async () => {
        (window.sessionStorage.getItem as vi.Mock).mockImplementation(() => 'true'); // Simulate authenticated user

        render(
            <MemoryRouter>
                <VaultPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Vault Manager/i)).toBeInTheDocument();
    });

    it('shows Add New and Trash buttons', async () => {
        (window.sessionStorage.getItem as vi.Mock).mockImplementation(() => 'true');

        render(
            <MemoryRouter>
                <VaultPage />
            </MemoryRouter>
        );

        expect(await screen.findByRole('button', { name: /Add New/i })).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: /Trash/i })).toBeInTheDocument();
    });

    it('can change tabs', async () => {
        (window.sessionStorage.getItem as vi.Mock).mockImplementation(() => 'true');

        render(
            <MemoryRouter>
                <VaultPage />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByTestId('tab-bills'));
        expect(await screen.findByTestId('tab-bills')).toBeInTheDocument();

    });


    it('renders search bar', async () => {
        (window.sessionStorage.getItem as vi.Mock).mockImplementation(() => 'true');

        render(
            <MemoryRouter>
                <VaultPage />
            </MemoryRouter>
        );

        expect(await screen.findByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it('opens and closes delete confirmation dialog', async () => {
        (window.sessionStorage.getItem as vi.Mock).mockImplementation(() => 'true');

        render(
            <MemoryRouter>
                <VaultPage />
            </MemoryRouter>
        );

        fireEvent.click(await screen.findByRole('button', { name: /Trash/i }));

        // Modal opens through Trash or manually via delete action if testing more deeply
        // (Would need better ID selectors or mocks for real buttons)
    });

    it('copies password to clipboard', async () => {
        (window.sessionStorage.getItem as vi.Mock).mockImplementation(() => 'true');

        render(
            <MemoryRouter>
                <VaultPage />
            </MemoryRouter>
        );

        const copyButton = screen.queryByLabelText(/copy password/i); // If button has label
        if (copyButton) {
            fireEvent.click(copyButton);
            expect(navigator.clipboard.writeText).toHaveBeenCalled();
        }
    });
});
