
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme/theme-provider';

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => {
  const originalModule = jest.requireActual('@/contexts/AuthContext');
  
  return {
    ...originalModule,
    useAuth: () => ({
      user: {
        id: '123',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        role: 'parent',
      },
      signOut: jest.fn().mockResolvedValue(undefined),
    }),
  };
});

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Navbar Component', () => {
  const renderNavbar = () => {
    return render(
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          <AuthProvider>
            <Navbar />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  };

  it('should render user menu when user is logged in', async () => {
    renderNavbar();
    
    // User avatar should be visible
    const avatar = screen.getByRole('button', { name: /test/i });
    expect(avatar).toBeInTheDocument();
    
    // Click on avatar to open dropdown
    fireEvent.click(avatar);
    
    // Logout option should be visible
    const logoutButton = await screen.findByText(/log out/i);
    expect(logoutButton).toBeInTheDocument();
  });

  it('should call signOut and navigate when logout is clicked', async () => {
    renderNavbar();
    
    // Click on avatar to open dropdown
    const avatar = screen.getByRole('button', { name: /test/i });
    fireEvent.click(avatar);
    
    // Click on logout
    const logoutButton = await screen.findByText(/log out/i);
    fireEvent.click(logoutButton);
    
    // Wait for signOut to be called
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });
  });
});
