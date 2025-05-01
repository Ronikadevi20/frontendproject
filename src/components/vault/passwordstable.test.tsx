import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PasswordsTable from '@/components/vault/PasswordsTable';
import PasswordListItem from '@/components/vault/PasswordListItem';

const dummyPasswords = [
    {
        id: '1',
        website_url: 'https://example.com',
        name: 'Example Site',
        username: 'testuser',
        password_value: 'password123',
        notes: '',
        category: 'SOCIAL',
        created_at: '2024-04-28T00:00:00Z',
        updated_at: '2024-04-28T00:00:00Z',
    },
];

const baseProps = {
    passwords: dummyPasswords,
    visiblePasswords: {},
    togglePasswordVisibility: vi.fn(),
    copyToClipboard: vi.fn(),
    handleSort: vi.fn(),
    sortField: 'website_url',
    sortDirection: 'asc',
    handleDelete: vi.fn(),
    navigate: vi.fn(),
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('PasswordsTable', () => {
    test('renders passwords table correctly', () => {
        render(<PasswordsTable {...baseProps} />);

        // More robust: check by role (table), check header, check one item
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByText(/Example Site/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/testuser/i)).toBeInTheDocument();
    });

    test('copy username button works', () => {
        render(<PasswordsTable {...baseProps} />);

        const rows = screen.getAllByRole('row');
        const firstRow = rows[1];
        const buttons = within(firstRow).getAllByRole('button');

        fireEvent.click(buttons[0]); // Copy button is first in actions
        expect(baseProps.copyToClipboard).toHaveBeenCalledWith('testuser');
    });


    test('sort by fields triggers correctly', () => {
        render(<PasswordsTable {...baseProps} />);

        fireEvent.click(screen.getByText(/Website\/Application/i));
        fireEvent.click(screen.getByText(/Website URL/i));
        fireEvent.click(screen.getByText(/Username/i));

        expect(baseProps.handleSort).toHaveBeenCalledTimes(3);
    });

    test('navigate to view and edit works', () => {
        render(<PasswordsTable {...baseProps} />);

        const rows = screen.getAllByRole('row');
        const firstRow = rows[1];
        const buttons = within(firstRow).getAllByRole('button');

        fireEvent.click(buttons[1]); // View button
        fireEvent.click(buttons[2]); // Edit button

        expect(baseProps.navigate).toHaveBeenCalledTimes(2);
    });

    test('delete button triggers handler', () => {
        render(<PasswordsTable {...baseProps} />);

        const deleteButtons = screen.getAllByRole('button').filter(button =>
            button.className.includes('text-red-600')
        );

        fireEvent.click(deleteButtons[0]);
        expect(baseProps.handleDelete).toHaveBeenCalled();
    });
});

describe('PasswordListItem', () => {
    const password = {
        id: '1',
        website: 'Example.com',
        username: 'testuser@example.com',
        password: 'SuperSecret123',
        url: 'https://example.com',
    };

    const toggleVisibility = vi.fn();
    const copyToClipboard = vi.fn();
    const navigate = vi.fn();

    test('renders password data correctly (hidden by default)', () => {
        render(
            <PasswordListItem
                password={password}
                isVisible={false}
                toggleVisibility={toggleVisibility}
                copyToClipboard={copyToClipboard}
                navigate={navigate}
            />
        );

        const items = screen.getAllByText(/example\.com/i);
        expect(items.length).toBeGreaterThan(0);
        expect(screen.getByText(/testuser@example\.com/i)).toBeInTheDocument();
        expect(screen.queryByText(/SuperSecret123/i)).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /https:\/\/example\.com/i })).toHaveAttribute('href', 'https://example.com');
    });

    test('toggles visibility when eye icon clicked', () => {
        render(
            <PasswordListItem
                password={password}
                isVisible={false}
                toggleVisibility={toggleVisibility}
                copyToClipboard={copyToClipboard}
                navigate={navigate}
            />
        );

        const toggleBtn = screen.getByRole('button', { name: /toggle visibility/i });
        fireEvent.click(toggleBtn);
        expect(toggleVisibility).toHaveBeenCalledWith('1');
    });

    test('shows password and copies it when visible', () => {
        render(
            <PasswordListItem
                password={password}
                isVisible={true}
                toggleVisibility={toggleVisibility}
                copyToClipboard={copyToClipboard}
                navigate={navigate}
            />
        );

        expect(screen.getByText(/SuperSecret123/i)).toBeInTheDocument();

        const copyBtn = screen.getByRole('button', { name: /Copy/i });
        fireEvent.click(copyBtn);
        expect(copyToClipboard).toHaveBeenCalledWith('SuperSecret123');
    });

    test('navigates to edit page on edit button click', () => {
        render(
            <PasswordListItem
                password={password}
                isVisible={false}
                toggleVisibility={toggleVisibility}
                copyToClipboard={copyToClipboard}
                navigate={navigate}
            />
        );

        const editBtn = screen.getAllByRole('button')[1]; // second icon button
        fireEvent.click(editBtn);
        expect(navigate).toHaveBeenCalledWith('/passwords/edit/1');
    });
});