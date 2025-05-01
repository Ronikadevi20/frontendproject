import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import ProductsTable from '@/components/vault/ProductsTable';
import { MemoryRouter } from 'react-router-dom';

const mockDocuments = [
    {
        id: '1',
        title: 'Example Document',
        description: 'Important doc',
        file_type: 'PDF',
        file_size: 1024 * 1024, // 1MB
        upload_date: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 86400000 * 5).toISOString(), // +5 days
        is_expired: false,
        expires_soon: true,
    },
];

const baseProps = {
    documents: mockDocuments,
    handleSort: vi.fn(),
    sortField: 'title',
    sortDirection: 'asc',
    handleDelete: vi.fn(),
    navigate: vi.fn(),
    handleDownload: vi.fn(),
};

describe('ProductsTable', () => {
    test('renders documents table correctly', () => {
        render(
            <MemoryRouter>
                <ProductsTable {...baseProps} />
            </MemoryRouter>
        );

        expect(screen.getByText(/Documents/i)).toBeInTheDocument();
        expect(screen.getByText(/Example Document/i)).toBeInTheDocument();
        expect(screen.getByText(/PDF/i)).toBeInTheDocument();
        expect(screen.getByText(/1 MB/i)).toBeInTheDocument();
        expect(screen.getByText(/Expiring Soon/i)).toBeInTheDocument();
    });

    test('download button works', () => {
        render(
            <MemoryRouter>
                <ProductsTable {...baseProps} />
            </MemoryRouter>
        );

        const rows = screen.getAllByRole('row');
        const firstRow = rows[1];
        const buttons = within(firstRow).getAllByRole('button');

        const downloadButton = buttons[0];
        fireEvent.click(downloadButton);

        expect(baseProps.handleDownload).toHaveBeenCalledWith('1');
    });

    test('navigate to view and edit works', () => {
        render(
            <MemoryRouter>
                <ProductsTable {...baseProps} />
            </MemoryRouter>
        );

        const rows = screen.getAllByRole('row');
        const firstRow = rows[1];
        const buttons = within(firstRow).getAllByRole('button');

        const viewButton = buttons[1];
        const editButton = buttons[2];

        fireEvent.click(viewButton);
        fireEvent.click(editButton);

        expect(baseProps.navigate).toHaveBeenCalledTimes(2);
        expect(baseProps.navigate).toHaveBeenCalledWith('/documents/view/1');
        expect(baseProps.navigate).toHaveBeenCalledWith('/documents/edit/1');
    });

    test('delete button works', () => {
        render(
            <MemoryRouter>
                <ProductsTable {...baseProps} />
            </MemoryRouter>
        );

        const rows = screen.getAllByRole('row');
        const firstRow = rows[1];
        const buttons = within(firstRow).getAllByRole('button');

        const deleteButton = buttons[3];
        fireEvent.click(deleteButton);

        expect(baseProps.handleDelete).toHaveBeenCalledWith(mockDocuments[0]);
    });

    test('sort buttons trigger handleSort', () => {
        render(
            <MemoryRouter>
                <ProductsTable {...baseProps} />
            </MemoryRouter>
        );

        const sortByTitle = screen.getByRole('button', { name: /Document Name/i });
        fireEvent.click(sortByTitle);
        expect(baseProps.handleSort).toHaveBeenCalledWith('title');

        const sortByUpload = screen.getByRole('button', { name: /Upload Date/i });
        fireEvent.click(sortByUpload);
        expect(baseProps.handleSort).toHaveBeenCalledWith('upload_date');

        const sortByExpiry = screen.getByRole('button', { name: /Expiry Date/i });
        fireEvent.click(sortByExpiry);
        expect(baseProps.handleSort).toHaveBeenCalledWith('expiry_date');
    });
});
