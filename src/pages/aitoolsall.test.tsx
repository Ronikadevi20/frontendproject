import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect } from 'vitest';
import AITools from '@/pages/AITools';

describe('AITools Dashboard', () => {
    test('renders the main heading and subtext', () => {
        render(
            <MemoryRouter>
                <AITools />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /Career Assistant Dashboard/i })).toBeInTheDocument();
        expect(screen.getByText(/Your personal AI assistant/i)).toBeInTheDocument();
    });

    test('renders Follow-Up Applications card with link', () => {
        render(
            <MemoryRouter>
                <AITools />
            </MemoryRouter>
        );

        expect(screen.getByText(/Follow-Up Applications/i)).toBeInTheDocument();
        expect(screen.getByText(/Generate AI-powered follow-up emails/i)).toBeInTheDocument();

        const followUpLink = screen.getByRole('link', { name: /Follow Up Now/i });
        expect(followUpLink).toBeInTheDocument();
        expect(followUpLink).toHaveAttribute('href', '/ai-tools/follow-up');
    });

    test('renders Resume & Cover Letter Builder card with link', () => {
        render(
            <MemoryRouter>
                <AITools />
            </MemoryRouter>
        );

        expect(screen.getByText(/Resume & Cover Letter Builder/i)).toBeInTheDocument();
        expect(screen.getByText(/Instantly create tailored resumes/i)).toBeInTheDocument();

        const resumeLink = screen.getByRole('link', { name: /Build Now/i });
        expect(resumeLink).toBeInTheDocument();
        expect(resumeLink).toHaveAttribute('href', '/ai-tools/resume-builder');
    });

    test('renders Interview & Assessment Preparation card with link', () => {
        render(
            <MemoryRouter>
                <AITools />
            </MemoryRouter>
        );

        expect(screen.getByText(/Interview & Assessment Preparation/i)).toBeInTheDocument();
        expect(screen.getByText(/Prepare effectively for interviews/i)).toBeInTheDocument();

        const prepLink = screen.getByRole('link', { name: /Prepare Now/i });
        expect(prepLink).toBeInTheDocument();
        expect(prepLink).toHaveAttribute('href', '/ai-tools/interview-prep');
    });
});
