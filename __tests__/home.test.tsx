import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home', () => {
  it('renders main heading', () => {
    render(<Home />);
    expect(screen.getByText(/Atelier Chef/i)).toBeInTheDocument();
  });

  it('renders Google login button', () => {
    render(<Home />);
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
  });
});
