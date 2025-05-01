
// InterviewPracticeAndCoverLetterView.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CoverLetterViewPage from '@/pages/CoverLetterViewPage';
import applicationApi from '@/api/applicationsApi';

vi.mock('@/api/applicationsApi', () => ({
    default: {
        getInterviewSessions: vi.fn(() => Promise.resolve([{ id: 1, title: 'Tech Round', interview_type: 'technical' }])),
        getInterviewMessages: vi.fn(() => Promise.resolve({ messages: [{ id: 1, sender: 'ai', content: 'Welcome!', created_at: '2024-01-01T00:00:00Z' }] })),
        chatWithInterviewBot: vi.fn(() => Promise.resolve({ reply: 'AI Response' })),
        saveInterviewSession: vi.fn(() => Promise.resolve({ success: true })),
        transcribeAudio: vi.fn(() => Promise.resolve({ transcript: 'Transcribed message' })),
        getCoverLetterById: vi.fn(() => Promise.resolve({
            id: 1,
            title: 'My Cover Letter',
            created_at: new Date().toISOString(),
            generated_content: 'Dear Company, I am interested...',
            job_description: 'Software Developer role',
            company: 'TechCorp'
        })),
        saveCoverLetter: vi.fn(() => Promise.resolve({})),
        regenerateCoverLetter: vi.fn(() => Promise.resolve({
            id: 1,
            title: 'My Cover Letter',
            generated_content: 'Regenerated content',
            created_at: new Date().toISOString()
        }))
    }
}));


describe('CoverLetterViewPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn(),
            }
        });
    });

    it('renders cover letter data', async () => {
        render(
            <MemoryRouter initialEntries={['/coverletter/1']}>
                <Routes>
                    <Route path="/coverletter/:id" element={<CoverLetterViewPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText(/My Cover Letter/)).toBeInTheDocument();
        expect(screen.getByText(/Created at:/i)).toBeInTheDocument();
    });

    it('allows editing and saving', async () => {
        render(
            <MemoryRouter initialEntries={['/coverletter/1']}>
                <Routes>
                    <Route path="/coverletter/:id" element={<CoverLetterViewPage />} />
                </Routes>
            </MemoryRouter>
        );

        const textarea = await screen.findByDisplayValue(/Dear Company/i);
        fireEvent.change(textarea, { target: { value: 'Updated text' } });

        const saveButton = screen.getByText(/💾 Save/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(applicationApi.saveCoverLetter).toHaveBeenCalled();
        });
    });

    it('copies to clipboard', async () => {
        render(
            <MemoryRouter initialEntries={['/coverletter/1']}>
                <Routes>
                    <Route path="/coverletter/:id" element={<CoverLetterViewPage />} />
                </Routes>
            </MemoryRouter>
        );

        const copyBtn = await screen.findByText(/📋 Copy/i);
        fireEvent.click(copyBtn);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringMatching(/Dear Company/));
    });

    it('regenerates cover letter', async () => {
        render(
            <MemoryRouter initialEntries={['/coverletter/1']}>
                <Routes>
                    <Route path="/coverletter/:id" element={<CoverLetterViewPage />} />
                </Routes>
            </MemoryRouter>
        );

        const regenBtn = await screen.findByText(/🔄 Regenerate/i);
        fireEvent.click(regenBtn);

        await waitFor(() => {
            expect(applicationApi.regenerateCoverLetter).toHaveBeenCalled();
        });

        expect(await screen.findByDisplayValue(/Regenerated content/)).toBeInTheDocument();
    });
});
