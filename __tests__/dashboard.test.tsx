import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../app/dashboard/page';

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Dashboard Loaded Successfully/i)).toBeInTheDocument();
  });

  it('renders input and button', () => {
    render(<Dashboard />);
    expect(screen.getByPlaceholderText(/Type ingredients/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate Recipe/i)).toBeInTheDocument();
  });

  it('renders chatbox input and button', () => {
    render(<Dashboard />);
    expect(screen.getByPlaceholderText(/Ask the chef/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask/i)).toBeInTheDocument();
  });
});
