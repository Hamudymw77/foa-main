import { render, screen, fireEvent } from '@testing-library/react';
import { MatchDetail } from '../MatchDetail';
import { Match } from '../../types';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock child components to avoid complex rendering
vi.mock('../MatchStatistics', () => ({
  MatchStatistics: () => <div data-testid="match-statistics">Statistics</div>
}));
vi.mock('../FormationView', () => ({
  FormationView: () => <div data-testid="formation-view">Formation</div>
}));
vi.mock('../MatchEvents', () => ({
  MatchEvents: () => <div data-testid="match-events">Events</div>
}));

const mockMatch: Match = {
  id: 'match-1',
  homeTeam: 'Home FC',
  awayTeam: 'Away FC',
  homeScore: 2,
  awayScore: 1,
  date: '2023-01-01',
  homeLogo: '/home.png',
  awayLogo: '/away.png',
  status: 'finished',
  timestamp: 1672531200, // Added dummy timestamp
  goals: [
    { minute: 10, team: 'home', scorer: 'Player 1', score: '1-0' }
  ]
};

describe('MatchDetail', () => {
  it('renders match info correctly', () => {
    render(
      <MatchDetail 
        selectedMatch={mockMatch} 
        activeTab="overview" 
        setActiveTab={() => {}} 
        showPredicted={false} 
        setShowPredicted={() => {}} 
      />
    );

    expect(screen.getAllByText('Home FC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Away FC').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2 - 1').length).toBeGreaterThan(0);
  });

  it('renders overview tab content', () => {
    render(
      <MatchDetail 
        selectedMatch={mockMatch} 
        activeTab="overview" 
        setActiveTab={() => {}} 
        showPredicted={false} 
        setShowPredicted={() => {}} 
      />
    );

    expect(screen.getByText('Goals')).toBeDefined();
    expect(screen.getByText('Player 1')).toBeDefined();
  });

  it('calls setActiveTab when clicking a tab', () => {
    const setActiveTab = vi.fn();
    render(
      <MatchDetail 
        selectedMatch={mockMatch} 
        activeTab="overview" 
        setActiveTab={setActiveTab} 
        showPredicted={false} 
        setShowPredicted={() => {}} 
      />
    );

    fireEvent.click(screen.getByText('Statistics'));
    expect(setActiveTab).toHaveBeenCalledWith('statistics');
  });
});
