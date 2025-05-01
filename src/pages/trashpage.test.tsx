// TrashPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, vi, beforeEach, expect } from 'vitest';
import TrashPage from '@/pages/TrashPage';
import trashApi from '@/api/trashApi';

vi.mock('@/api/trashApi');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TrashPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('isAuthenticated', 'true');
  });

  test('renders empty trash state', async () => {
    trashApi.list.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <TrashPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Your trash is empty/i)).toBeInTheDocument();
  });

  test('renders trash table with items', async () => {
    trashApi.list.mockResolvedValue([
      {
        id: 1,
        type: 'document',
        name: 'My Doc',
        deleted_at: new Date().toISOString(),
        details: { file_type: 'PDF' }
      }
    ]);

    render(
      <MemoryRouter>
        <TrashPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/My Doc/i)).toBeInTheDocument();
    expect(screen.getByText(/File type: PDF/i)).toBeInTheDocument();
  });
});
