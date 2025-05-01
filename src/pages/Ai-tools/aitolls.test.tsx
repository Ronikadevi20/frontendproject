// followupInterviewResume.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import FollowUp from '@/pages/Ai-tools/FollowUp';
import InterviewPrep from '@/pages/Ai-tools/InterviewPrep';
import ResumeBuilder from '@/pages/Ai-tools/ResumeBuilder';
import applicationApi from '@/api/applicationsApi';

vi.mock('@/api/applicationsApi');
vi.mock('@/components/ui/FollowUpModal', () => ({
    default: () => <div data-testid="mock-followup-modal">Modal</div>,
}));
vi.mock('@/components/ui/ResumeModal', () => ({
    default: () => <div data-testid="mock-resume-modal">Resume Modal</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('FollowUp Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders empty state when no pending follow-ups', async () => {
        applicationApi.list.mockResolvedValue([]);
        render(
            <MemoryRouter>
                <FollowUp />
            </MemoryRouter>
        );
        expect(await screen.findByText(/No applications currently require follow-up/i)).toBeInTheDocument();
    });

    test('renders job with generate email option', async () => {
        applicationApi.list.mockResolvedValue([
            { id: '1', job_title: 'Dev', company: 'ABC', applied_date: new Date().toISOString(), status: 'applied' }
        ]);
        render(
            <MemoryRouter>
                <FollowUp />
            </MemoryRouter>
        );
        expect(await screen.findByText(/Dev/)).toBeInTheDocument();
        expect(screen.getByText(/Generate Email/)).toBeInTheDocument();
    });
});

describe('InterviewPrep Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('shows empty state when no interviewing/assessment apps', async () => {
        applicationApi.list.mockResolvedValue([]);
        render(
            <MemoryRouter>
                <InterviewPrep />
            </MemoryRouter>
        );
        expect(await screen.findByText(/No Interview or Assessment Applications Yet/i)).toBeInTheDocument();
    });

    test('renders application cards for interview prep', async () => {
        applicationApi.list.mockResolvedValue([
            { id: 1, job_title: 'Intern', company: 'TechCorp', status: 'interviewing' }
        ]);
        render(
            <MemoryRouter>
                <InterviewPrep />
            </MemoryRouter>
        );
        expect(await screen.findByText(/Intern/)).toBeInTheDocument();
        expect(screen.getByText(/Prepare Now/)).toBeInTheDocument();
    });
});

describe('ResumeBuilder Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    test('renders empty state when no resumes or cover letters', async () => {
        applicationApi.listResumes.mockResolvedValue([]);
        applicationApi.listCover.mockResolvedValue([]);

        render(
            <MemoryRouter>
                <ResumeBuilder />
            </MemoryRouter>
        );

        expect(await screen.findByText(/you currently have no saved resumes/i)).toBeInTheDocument();
    });


    test('renders resumes and actions', async () => {
        applicationApi.listResumes.mockResolvedValue([
            { id: 1, title: 'Dev Resume', created_at: new Date().toISOString() }
        ]);
        applicationApi.listCover.mockResolvedValue([]);

        render(
            <MemoryRouter>
                <ResumeBuilder />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Dev Resume/)).toBeInTheDocument();
        expect(screen.getByText(/View/)).toBeInTheDocument();
        expect(screen.getByText(/Trash/)).toBeInTheDocument();
    });
});
