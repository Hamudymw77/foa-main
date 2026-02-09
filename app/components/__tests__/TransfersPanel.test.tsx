import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransfersPanel } from '../TransfersPanel'
import { Transfer } from '@/types'

describe('TransfersPanel', () => {
  const mockTransfers: Transfer[] = [
    {
      id: '1',
      player: 'John Doe',
      position: 'Forward',
      age: 25,
      oldClub: 'Club A',
      newClub: 'Club B',
      fee: 10000000,
      feeDisplay: '£10.0M',
      date: '2025-07-01',
      contractLength: '5 years',
      type: 'permanent'
    },
    {
      id: '2',
      player: 'Jane Smith',
      position: 'Midfielder',
      age: 28,
      oldClub: 'Club C',
      newClub: 'Club D',
      fee: 0,
      feeDisplay: 'Free',
      date: '2025-07-02',
      contractLength: '3 years',
      type: 'free'
    }
  ];

  it('renders transfers correctly', () => {
    render(<TransfersPanel transfers={mockTransfers} isLoading={false} />);
    // Use getAllByText because stats panel might show "Highest Transfer" or "Top Spender"
    expect(screen.getAllByText('John Doe')[0]).toBeDefined();
    expect(screen.getByText('Jane Smith')).toBeDefined();
    expect(screen.getByText('Club A')).toBeDefined();
    // Club B is top spender, so it appears twice
    expect(screen.getAllByText('Club B')[0]).toBeDefined();
    // Fee appears in list and stats
    expect(screen.getAllByText('£10.0M')[0]).toBeDefined();
  });

  it('shows loading state', () => {
    render(<TransfersPanel transfers={[]} isLoading={true} />);
    expect(screen.getByText('Loading transfers...')).toBeDefined();
  });

  it('filters transfers by search term', () => {
    render(<TransfersPanel transfers={mockTransfers} isLoading={false} />);
    
    // Find search input by placeholder or icon
    const searchInput = screen.getByPlaceholderText(/search player/i);
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    // John Doe should still be visible (in list and potentially stats)
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    // Jane Smith should be filtered out
    expect(screen.queryByText('Jane Smith')).toBeNull();
  });
});
