import { renderHook, waitFor } from '@testing-library/react';
import { useStatisticsData } from '../useStatisticsData';
import { describe, it, expect, vi } from 'vitest';

// Mock DataService
vi.mock('../../services/dataService', () => ({
  DataService: {
    getTopScorers: vi.fn().mockResolvedValue([
      { id: '1', name: 'Haaland E.', team: 'Man City', goals: 10, assists: 2, countryCode: 'no', matchesPlayed: 10, minutesPlayed: 900, goalsPerMatch: 1 }
    ]),
    getBestDefense: vi.fn().mockResolvedValue([
      { team: 'Arsenal', logo: '/arsenal.svg', goalsAgainst: 5, cleanSheets: 10 }
    ]),
    getPlayersStats: vi.fn().mockResolvedValue([])
  }
}));

describe('useStatisticsData', () => {
  it('returns top scorers', async () => {
    const { result } = renderHook(() => useStatisticsData());
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for data
    await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.topScorers).toBeDefined();
    expect(result.current.topScorers.length).toBeGreaterThan(0);
    expect(result.current.topScorers[0].name).toBe('Haaland E.');
  });

  it('returns best defense stats', async () => {
    const { result } = renderHook(() => useStatisticsData());
    
    await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bestDefense).toBeDefined();
    expect(result.current.bestDefense.length).toBeGreaterThan(0);
    expect(result.current.bestDefense[0].team).toBe('Arsenal');
  });
});
