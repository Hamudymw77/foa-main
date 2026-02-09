import { renderHook, waitFor } from '@testing-library/react';
import { useFootballData } from '../useFootballData';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockStandings = [
  { team: 'Team A', points: 10 }
];

const mockMatches = [
  { id: '1', status: 'finished', timestamp: 1000 },
  { id: '2', status: 'upcoming', timestamp: 2000 }
];

describe('useFootballData', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('starts with loading state', async () => {
    // Return promises that never resolve initially to test loading state
    mockFetch.mockImplementation(() => new Promise(() => {}));
    
    const { result } = renderHook(() => useFootballData());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.standings).toEqual([]);
    expect(result.current.matches).toEqual([]);
  });

  it('fetches and separates data correctly', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStandings,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMatches,
      });

    const { result } = renderHook(() => useFootballData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.standings).toEqual(mockStandings);
    expect(result.current.matches).toHaveLength(1); // One finished match
    expect(result.current.upcomingMatches).toHaveLength(1); // One upcoming match
    expect(result.current.matches[0].id).toBe('1');
    expect(result.current.upcomingMatches[0].id).toBe('2');
  });

  it('handles fetch errors', async () => {
    const error = new Error('Network error');
    mockFetch.mockRejectedValue(error);

    const { result } = renderHook(() => useFootballData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
  });
});
