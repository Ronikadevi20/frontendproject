import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import UpcomingBillsSection from '@/components/vault/UpcomingBillingTable';
import { MemoryRouter } from 'react-router-dom';

const mockBills = [
    { id: '1', name: 'Netflix Subscription', due_date: '2024-06-01', amount: 14.99 },
    { id: '2', name: 'Spotify Premium', due_date: '2024-06-05', amount: 9.99 },
    { id: '3', name: 'Electricity Bill', due_date: '2024-06-03', amount: 75.50 },
    { id: '4', name: 'Water Bill', due_date: '2024-06-07', amount: 45.20 },
];

describe('UpcomingBillsSection', () => {
    const navigate = vi.fn();
    const setSearchQuery = vi.fn();
    const setSelectedCategory = vi.fn();

    test('renders upcoming bills correctly', () => {
        render(
            <MemoryRouter>
                <UpcomingBillsSection
                    upcomingBills={mockBills}
                    navigate={navigate}
                    setSearchQuery={setSearchQuery}
                    setSelectedCategory={setSelectedCategory}
                />
            </MemoryRouter>
        );

        expect(screen.getByText(/Netflix Subscription/i)).toBeInTheDocument();
        expect(screen.getByText(/Spotify Premium/i)).toBeInTheDocument();
        expect(screen.getByText(/Electricity Bill/i)).toBeInTheDocument();
        expect(screen.queryByText(/Water Bill/i)).not.toBeInTheDocument(); // only first 3 shown

        expect(screen.getByText('$14.99')).toBeInTheDocument();
        expect(screen.getByText('$9.99')).toBeInTheDocument();
        expect(screen.getByText('$75.50')).toBeInTheDocument();
    });

    test('clicking Update navigates to edit bill', () => {
        render(
            <MemoryRouter>
                <UpcomingBillsSection
                    upcomingBills={mockBills}
                    navigate={navigate}
                    setSearchQuery={setSearchQuery}
                    setSelectedCategory={setSelectedCategory}
                />
            </MemoryRouter>
        );

        const updateButtons = screen.getAllByRole('button', { name: /Update/i });
        fireEvent.click(updateButtons[0]);
        expect(navigate).toHaveBeenCalledWith('/bills/edit/1');
    });

    test('clicking View All bills button triggers setSearchQuery and setSelectedCategory', () => {
        render(
            <MemoryRouter>
                <UpcomingBillsSection
                    upcomingBills={mockBills}
                    navigate={navigate}
                    setSearchQuery={setSearchQuery}
                    setSelectedCategory={setSelectedCategory}
                />
            </MemoryRouter>
        );

        const viewAllBtn = screen.getByRole('button', { name: /View all 4 upcoming bills/i });
        fireEvent.click(viewAllBtn);

        expect(setSearchQuery).toHaveBeenCalledWith('');
        expect(setSelectedCategory).toHaveBeenCalledWith('bills');
    });

    test('does not render if no upcoming bills', () => {
        const { container } = render(
            <MemoryRouter>
                <UpcomingBillsSection
                    upcomingBills={[]}
                    navigate={navigate}
                    setSearchQuery={setSearchQuery}
                    setSelectedCategory={setSelectedCategory}
                />
            </MemoryRouter>
        );

        expect(container.firstChild).toBeNull();
    });
});
