/// <reference types="vitest" />
import { renderHook, act } from '@testing-library/react';
import { useDashboardState } from '../useDashboardState';
import { describe, it, expect } from 'vitest';

describe('useDashboardState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDashboardState());

    expect(result.current.selectedMatchId).toBe('match-1');
    expect(result.current.activeTab).toBe('statistics');
    expect(result.current.showStatistics).toBe(false);
  });

  it('should update selected match correctly', () => {
    const { result } = renderHook(() => useDashboardState());

    act(() => {
      result.current.handleSelectMatch('match-2', true);
    });

    expect(result.current.selectedMatchId).toBe('match-2');
    expect(result.current.activeTab).toBe('statistics');
  });

  it('should accept an initialMatchId override', () => {
    const { result } = renderHook(() => useDashboardState('match-99'));
    expect(result.current.selectedMatchId).toBe('match-99');
  });
});
