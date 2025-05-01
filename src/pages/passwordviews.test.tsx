// PasswordsView.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, vi, beforeEach, expect } from 'vitest';
import PasswordEntryForm from '@/pages/PasswordEntryForm';
import PasswordFormView from '@/pages/PasswordFormView';
import passwordsApi from '@/api/passwordApi';
import { analyzePasswordStrength } from '@/services/aiClassifier';
import Index from '@/pages/Index'; // Adjust the path if different

// Mock navigate
vi.mock('@/api/passwordApi');
vi.mock('@/services/aiClassifier', () => ({
    analyzePasswordStrength: vi.fn(() => ({
        score: 3,
        strength: 'medium',
        suggestions: ['Use more symbols', 'Make it longer']
    }))
}));

const mockNavigate = vi.fn();
const mockParams = vi.fn(() => ({ id: '1' }));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => mockParams(),
    };
});

Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(),
    },
});

describe('PasswordEntryForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders add mode form', () => {
        mockParams.mockReturnValueOnce({}); // No id = add mode
        render(
            <MemoryRouter>
                <PasswordEntryForm />
            </MemoryRouter>
        );

        expect(screen.getByText(/Add New Password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g. LinkedIn/i)).toBeInTheDocument();
    });

    test('renders edit mode and loads password', async () => {
        mockParams.mockReturnValueOnce({ id: '1' });

        (passwordsApi.get as any).mockResolvedValue({
            id: '1',
            name: 'Google',
            username: 'test@gmail.com',
            password_value: 'mypassword123',
        });

        render(
            <MemoryRouter>
                <PasswordEntryForm />
            </MemoryRouter>
        );

        expect(await screen.findByDisplayValue('Google')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@gmail.com')).toBeInTheDocument();
    });

    test('can generate password and show', async () => {
        mockParams.mockReturnValueOnce({});
        render(
            <MemoryRouter>
                <PasswordEntryForm />
            </MemoryRouter>
        );

        const generateBtn = screen.getByText('Generate');
        fireEvent.click(generateBtn);

        await waitFor(() => {
            const passwordInput = screen.getByPlaceholderText('Your secure password') as HTMLInputElement;
            expect(passwordInput.value.length).toBe(16);
        });
    });

    test('shows password strength', async () => {
        mockParams.mockReturnValueOnce({});
        render(
            <MemoryRouter>
                <PasswordEntryForm />
            </MemoryRouter>
        );

        const passwordInput = screen.getByPlaceholderText('Your secure password');
        fireEvent.change(passwordInput, { target: { value: 'NewPass123!' } });

        expect(await screen.findByText(/Password Strength/i)).toBeInTheDocument();
        expect(screen.getByText(/Medium/i)).toBeInTheDocument();
    });

    test('validates empty fields', async () => {
        mockParams.mockReturnValueOnce({});
        render(
            <MemoryRouter>
                <PasswordEntryForm />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        expect(await screen.findByText(/Website\/Application name is required/i)).toBeInTheDocument();
    });
});

    describe('PasswordFormView', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        test('shows not found error', async () => {
            mockParams.mockReturnValueOnce({ id: '1' });
            (passwordsApi.get as any).mockRejectedValue(new Error('fail'));

            render(
                <MemoryRouter>
                    <PasswordFormView />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/Password Not Found/i)
                );
            });
        });

        test('renders password view', async () => {
            mockParams.mockReturnValueOnce({ id: '1' });
            (passwordsApi.get as any).mockResolvedValue({
                id: '1',
                name: 'Facebook',
                username: 'testuser',
                password_value: 'secret1234',
                website_url: 'https://facebook.com',
                notes: 'My main FB account'
            });

            render(
                <MemoryRouter>
                    <PasswordFormView />
                </MemoryRouter>
            );

            expect(await screen.findByRole('heading', { name: /Facebook/i })).toBeInTheDocument();
            expect(screen.getByText(/testuser/i)).toBeInTheDocument();
            expect(screen.getByText(/Password Strength/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Visit website/i })).toBeInTheDocument();
        });

        test('copy username and password', async () => {
            mockParams.mockReturnValueOnce({ id: '1' });
            (passwordsApi.get as any).mockResolvedValue({
                id: '1',
                name: 'LinkedIn',
                username: 'user123',
                password_value: 'pass1234',
            });

            render(
                <MemoryRouter>
                    <PasswordFormView />
                </MemoryRouter>
            );

            expect(await screen.findByText(/LinkedIn/i)).toBeInTheDocument();

            fireEvent.click(screen.getAllByLabelText(/Copy username/i)[0]);
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('user123');

            fireEvent.click(screen.getAllByLabelText(/Copy password/i)[0]);
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('pass1234');
        });

        test('navigate to edit password', async () => {
            mockParams.mockReturnValueOnce({ id: '1' });
            (passwordsApi.get as any).mockResolvedValue({
                id: '1',
                name: 'Test',
                username: 'tester',
                password_value: '12345',
            });

            render(
                <MemoryRouter>
                    <PasswordFormView />
                </MemoryRouter>
            );

            expect(await screen.findByRole('heading', { name: /Test/i })).toBeInTheDocument();

            const editButtons = await screen.findAllByRole('button', { name: /Edit Password/i });
            fireEvent.click(editButtons[0]);  // or [1] depending on which button you want

            expect(mockNavigate).toHaveBeenCalledWith('/passwords/edit/1');
        });
    });
    describe('Index component', () => {
        test('redirects to landing page on mount', () => {
          render(
            <MemoryRouter>
              <Index />
            </MemoryRouter>
          );
      
          expect(mockNavigate).toHaveBeenCalledWith('/');
        });
      });