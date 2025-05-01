import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import LandingPage from '@/pages/LandingPage';

vi.mock('embla-carousel-react', () => {
  return {
    __esModule: true,
    default: () => [
      null, // viewportRef
      {
        canScrollPrev: () => false,
        canScrollNext: () => true,
        scrollPrev: () => { },
        scrollNext: () => { },
        on: () => { },
        off: () => { },
        reInit: () => { },
      },
    ],
  };
});


beforeEach(() => {
  global.IntersectionObserver = class {
    constructor(callback: any) { }
    observe() { }
    unobserve() { }
    disconnect() { }
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
});

// --- Your describe('LandingPage') starts here...

describe('LandingPage', () => {
  test('renders LandingPage without crashing', async () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    await screen.findByText((content, element) => {
      const hasText = (node: Element) => node.textContent === 'Secure Your Vault Journey';
      const nodeHasText = hasText(element!);
      const childrenDontHaveText = Array.from(element!.children).every(child => !hasText(child));
      return nodeHasText && childrenDontHaveText;
    });

  });
  test('shows Get Started and Login buttons when not authenticated', () => {
    (window.sessionStorage.getItem as vi.Mock).mockReturnValue(null);

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getAllByRole('button', { name: /Get Started/i })[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
  });

  test('shows Go to Dashboard button when authenticated', () => {
    (window.sessionStorage.getItem as vi.Mock).mockReturnValue('something');


    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const dashboardButtons = screen.getAllByRole('button', { name: /Go to Dashboard/i });
    expect(dashboardButtons.length).toBeGreaterThan(0);
  });

  test('displays animated statistics section', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Students Served/i)).toBeInTheDocument();
    const trackers = screen.getAllByText(/Application Tracker/i);
    expect(trackers.length).toBeGreaterThan(0);
    expect(screen.getByText(/Satisfaction Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Job Offers Received/i)).toBeInTheDocument();
  });

  test('renders Features section', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Features That Simplify Your Job Search/i)).toBeInTheDocument();

    const trackers = screen.getAllByText(/Application Tracker/i);
    expect(trackers.length).toBeGreaterThan(0);

    const passwordManager = screen.getAllByText(/Password Manager/i);
    expect(passwordManager.length).toBeGreaterThan(0);

    const secureStorage = screen.getAllByText(/Secure Storage/i);
    expect(secureStorage.length).toBeGreaterThan(0);

    const easyManagement = screen.getAllByText(/Easy Management/i);
    expect(easyManagement.length).toBeGreaterThan(0);
  });

  test('renders How EncryptEase Works steps', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const signUps = screen.getAllByText(/Sign Up/i);
    expect(signUps.length).toBeGreaterThan(0);
    expect(screen.getByText(/Add Your Data/i)).toBeInTheDocument();
    expect(screen.getByText(/Stay Organized/i)).toBeInTheDocument();
  });

  test('renders Explore More Features carousel', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Status Tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/Insights & Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Deadline Reminders/i)).toBeInTheDocument();
    expect(screen.getByText(/Multiple Categories/i)).toBeInTheDocument();
  });

  test('renders Testimonials section', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/What Our Users Say/i)).toBeInTheDocument();
    expect(screen.getByText(/Jessica D./i)).toBeInTheDocument();
    expect(screen.getByText(/Michael R./i)).toBeInTheDocument();
    expect(screen.getByText(/Aisha T./i)).toBeInTheDocument();
  });

  test('renders FAQ section', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Is EncryptEase free to use/i)).toBeInTheDocument();
    expect(screen.getByText(/How secure is my data/i)).toBeInTheDocument();
    expect(screen.getByText(/Can I access EncryptEase on mobile/i)).toBeInTheDocument();
    expect(screen.getByText(/Can I export my data/i)).toBeInTheDocument();
  });
});
