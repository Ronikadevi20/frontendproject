import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocumentsSection from '@/components/vault/DocumentsSection';
import DocumentsPreview from '@/components/vault/DocumentsPreview';
import { describe, test, expect } from 'vitest';


describe('DocumentsSection', () => {
    test('renders title, description and button correctly', () => {
        render(
            <MemoryRouter>
                <DocumentsSection />
            </MemoryRouter>
        );

        expect(screen.getByText(/Access Your Secure Document Vault/i)).toBeInTheDocument();
        expect(screen.getByText(/Store and manage sensitive documents/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Go to Document Vault/i })).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/documents');
    });
});


describe('DocumentsPreview', () => {
    test('renders preview title, message and button correctly', () => {
        render(
            <MemoryRouter>
                <DocumentsPreview />
            </MemoryRouter>
        );

        expect(screen.getByText(/Document Vault/i)).toBeInTheDocument();
        expect(screen.getByText(/Access your secure documents/i)).toBeInTheDocument();
        expect(screen.getByText(/Store and manage important files/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View Documents/i })).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/documents');
    });
});
