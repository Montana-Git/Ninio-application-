import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentManagement from '../../../../components/dashboard/admin/PaymentManagement';
import { vi } from 'vitest';

// Mock the API calls
vi.mock('../../../../lib/api', () => ({
  getPayments: vi.fn().mockResolvedValue({
    data: [
      {
        id: '1',
        parent_id: 'parent1',
        amount: 100,
        status: 'completed',
        date: '2023-01-01',
        payment_method: 'credit_card',
        description: 'Tuition payment',
        category: 'Tuition',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      },
      {
        id: '2',
        parent_id: 'parent2',
        amount: 50,
        status: 'pending',
        date: '2023-01-02',
        payment_method: 'bank_transfer',
        description: 'Supplies payment',
        category: 'Supplies',
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      }
    ],
    error: null
  }),
  getParents: vi.fn().mockResolvedValue({
    data: [
      { id: 'parent1', name: 'John Doe' },
      { id: 'parent2', name: 'Jane Smith' }
    ],
    error: null
  }),
  getChildren: vi.fn().mockResolvedValue({
    data: [
      { id: 'child1', name: 'Child 1', parentId: 'parent1' },
      { id: 'child2', name: 'Child 2', parentId: 'parent2' }
    ],
    error: null
  }),
  updatePaymentStatus: vi.fn().mockResolvedValue({
    data: { id: '1', status: 'refunded' },
    error: null
  })
}));

describe('PaymentManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders payment management component', async () => {
    render(<PaymentManagement />);
    
    // Check if the component title is rendered
    expect(screen.getByText('Payment Management')).toBeInTheDocument();
    
    // Wait for the payments to load
    await waitFor(() => {
      expect(screen.getByText('Tuition payment')).toBeInTheDocument();
      expect(screen.getByText('Supplies payment')).toBeInTheDocument();
    });
  });

  test('filters payments by status', async () => {
    render(<PaymentManagement />);
    
    // Wait for the payments to load
    await waitFor(() => {
      expect(screen.getByText('Tuition payment')).toBeInTheDocument();
    });
    
    // Click on the status filter
    const statusFilter = screen.getByText('All Statuses');
    userEvent.click(statusFilter);
    
    // Select 'Completed' status
    const completedOption = screen.getByText('Completed');
    userEvent.click(completedOption);
    
    // Check if only completed payments are shown
    await waitFor(() => {
      expect(screen.getByText('Tuition payment')).toBeInTheDocument();
      expect(screen.queryByText('Supplies payment')).not.toBeInTheDocument();
    });
  });

  test('sorts payments by date', async () => {
    render(<PaymentManagement />);
    
    // Wait for the payments to load
    await waitFor(() => {
      expect(screen.getByText('Tuition payment')).toBeInTheDocument();
    });
    
    // Click on the date header to sort
    const dateHeader = screen.getByText('Date');
    userEvent.click(dateHeader);
    
    // Check if the payments are sorted by date
    await waitFor(() => {
      const paymentRows = screen.getAllByRole('row');
      // First row is header, second row should be the earliest payment
      expect(paymentRows[1]).toHaveTextContent('2023-01-01');
      expect(paymentRows[2]).toHaveTextContent('2023-01-02');
    });
    
    // Click again to reverse sort order
    userEvent.click(dateHeader);
    
    // Check if the sort order is reversed
    await waitFor(() => {
      const paymentRows = screen.getAllByRole('row');
      // First row is header, second row should now be the latest payment
      expect(paymentRows[1]).toHaveTextContent('2023-01-02');
      expect(paymentRows[2]).toHaveTextContent('2023-01-01');
    });
  });
});
