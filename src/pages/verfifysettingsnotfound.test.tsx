// VerificationPage.test.tsx + NotFound.test.tsx + SettingsPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import VerificationPage from '@/pages/VerificationPage';
import NotFound from '@/pages/NotFound';
import SettingsPage from '@/pages/SettingsPage';
import * as authApi from '@/api/authApi';
import * as settingsApi from '@/api/settingsApi';
import useAuth from '@/hooks/useAuth';
const mockNavigate = vi.fn();
import { afterEach } from 'vitest';
afterEach(() => {
    vi.clearAllMocks();
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/fake-path' }), // for NotFound
        useParams: () => ({ email: 'test@example.com', otp_code: '123456' }) // for VerificationPage
    };
});
vi.mock('@/api/authApi', () => ({
    authApi: {
        verifyAccount: vi.fn(), // <- ensure it's a spyable function
    }
}));
vi.mock('@/components/settings/AccountSettings', () => ({
    default: ({ user }: any) => <div>{user.name}</div>
}));
vi.mock('@/hooks/useAuth');
vi.mock('@/api/settingsApi', () => ({
    getSettings: vi.fn(),
    updateSettings: vi.fn()
}));

describe('VerificationPage', () => {
    test('calls verifyAccount if email and otp_code exist', async () => {
        (authApi.authApi.verifyAccount as any).mockResolvedValue({});

        render(
            <MemoryRouter initialEntries={["/verify/test@example.com/123456"]}>
                <Routes>
                    <Route path="/verify/:email/:otp_code" element={<VerificationPage />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(authApi.authApi.verifyAccount).toHaveBeenCalledWith({
                email: 'test@example.com',
                otp_code: '123456'
            });
        });
    });
});

describe('NotFound', () => {
    test('renders 404 message and link', () => {
        render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        );

        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /return to home/i })).toBeInTheDocument();
    });
});

describe('SettingsPage', () => {

    beforeEach(() => {
        vi.mock('react-router-dom', async () => {
            const actual = await vi.importActual('react-router-dom');
            return {
                ...actual,
                useNavigate: () => mockNavigate,
            };
        });
    });

    test('redirects to login if no user', async () => {
        (useAuth as any).mockReturnValue({ user: null, isLoading: false, logout: vi.fn() });
        render(
            <MemoryRouter>
                <SettingsPage />
            </MemoryRouter>
        );
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    test('renders error if settings not loaded', async () => {
        (useAuth as any).mockReturnValue({ user: { name: 'Test' }, isLoading: false, logout: vi.fn() });
        (settingsApi.getSettings as any).mockRejectedValue(new Error('Failed'));
        render(
            <MemoryRouter>
                <SettingsPage />
            </MemoryRouter>
        );
        expect(await screen.findByText('Failed to load user data')).toBeInTheDocument();
    });
});
