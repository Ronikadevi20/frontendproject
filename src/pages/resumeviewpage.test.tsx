// resumepageview.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, vi, beforeEach, expect } from 'vitest';
import ResumeViewPage from '@/pages/ResumeViewPage';
import applicationApi from '@/api/applicationsApi';

// Mock navigate and params
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ id: '1' }),
    };
});

// Mock Clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(),
    },
});

// Mock html2pdf
vi.mock('html2pdf.js', () => ({
    default: () => ({
        from: () => ({
            set: () => ({
                save: vi.fn(),
            }),
        }),
    }),
}));

// Mock API
vi.mock('@/api/applicationsApi', () => ({
    default: {
        getResumeById: vi.fn(),
        saveResume: vi.fn(),
        regenerateResume: vi.fn(),
    }
}));

describe('ResumeViewPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('shows loading initially', () => {
        render(
            <MemoryRouter>
                <ResumeViewPage />
            </MemoryRouter>
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('shows error if no resume found', async () => {
        (applicationApi.getResumeById as any).mockRejectedValueOnce(new Error('fail'));

        render(
            <MemoryRouter>
                <ResumeViewPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Resume not found.')).toBeInTheDocument();
        });
    });

    test('renders resume and handles buttons', async () => {
        const fakeResume = {
            id: 1,
            title: 'My Resume',
            created_at: new Date().toISOString(),
            generated_content: 'Example resume content',
            job_description: 'Job description text',
        };

        (applicationApi.getResumeById as any).mockResolvedValue(fakeResume);
        (applicationApi.saveResume as any).mockResolvedValue({ success: true });
        (applicationApi.regenerateResume as any).mockResolvedValue({
            ...fakeResume,
            generated_content: 'New resume content'
        });

        render(
            <MemoryRouter>
                <ResumeViewPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/My Resume/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText('📋 Copy'));
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Example resume content');

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Updated resume content' } });
        fireEvent.click(screen.getByText(/💾 Save/));

        await waitFor(() => {
            expect(applicationApi.saveResume).toHaveBeenCalled();
        });

        fireEvent.click(screen.getByText('⬇️ Download PDF'));
        fireEvent.click(screen.getByText('🔄 Regenerate'));

        await waitFor(() => {
            expect(applicationApi.regenerateResume).toHaveBeenCalled();
        });
    });

    test('back and close buttons navigate correctly', async () => {
        const fakeResume = {
            id: 1,
            title: 'Test Resume',
            created_at: new Date().toISOString(),
            generated_content: 'Some content',
            job_description: 'test',
        };

        (applicationApi.getResumeById as any).mockResolvedValue(fakeResume);

        render(
            <MemoryRouter>
                <ResumeViewPage />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Test Resume/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Back to AI Tools/i));
        expect(mockNavigate).toHaveBeenCalledWith('/ai-tools');

        fireEvent.click(screen.getByText('✕ Close'));
        expect(mockNavigate).toHaveBeenCalledWith('/ai-tools/resume-builder');
    });
});
