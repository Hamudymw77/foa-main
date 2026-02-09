/// <reference types="vitest" />
import { renderHook, act } from '@testing-library/react';
import { useDashboardState } from '../useDashboardState';
import { describe, it, expect } from 'vitest';

describe('useDashboardState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDashboardState());

    expect(result.current.selectedMatchId).toBe('match-1');
    expect(result.current.activeTab).toBe('overview');
    expect(result.current.showStatistics).toBe(false);
    expect(result.current.showPredicted).toBe(false);
  });

  it('should update selected match and tab correctly for upcoming match', () => {
    const { result } = renderHook(() => useDashboardState());

    act(() => {
      result.current.handleSelectMatch('match-2', true);
    });

    expect(result.current.selectedMatchId).toBe('match-2');
    expect(result.current.activeTab).toBe('formation');
    expect(result.current.showPredicted).toBe(true);
  });

  it('should update selected match and tab correctly for finished match', () => {
    const { result } = renderHook(() => useDashboardState());

    // First set to upcoming to change state
    act(() => {
      result.current.handleSelectMatch('match-2', true);
    });

    // Then set to finished
    act(() => {
      result.current.handleSelectMatch('match-3', false);
    });

    expect(result.current.selectedMatchId).toBe('match-3');
    expect(result.current.activeTab).toBe('overview');
    expect(result.current.showPredicted).toBe(false);
  });
});
