import { render, screen } from '@testing-library/react';
import { LeagueTable } from '../LeagueTable';
import { TeamStanding } from '../../types';
import { describe, it, expect } from 'vitest';
import React from 'react';

const mockStandings: TeamStanding[] = [
  {
    pos: 1,
    team: 'Team A',
    played: 10,
    won: 8,
    drawn: 1,
    lost: 1,
    gd: 20,
    gf: 25,
    ga: 5,
    points: 25,
    form: ['W', 'W', 'W', 'D', 'W'],
    logo: '/team-a.png'
  },
  {
    pos: 18,
    team: 'Team B',
    played: 10,
    won: 1,
    drawn: 2,
    lost: 7,
    gd: -15,
    gf: 5,
    ga: 20,
    points: 5,
    form: ['L', 'L', 'D', 'L', 'L'],
    logo: '/team-b.png'
  }
];

describe('LeagueTable', () => {
  it('renders table headers correctly', () => {
    render(<LeagueTable standings={mockStandings} />);
    
    expect(screen.getByText('Pos')).toBeDefined();
    expect(screen.getByText('Team')).toBeDefined();
    expect(screen.getByText('P')).toBeDefined();
    expect(screen.getByText('Pts')).toBeDefined();
  });

  it('renders team data correctly', () => {
    render(<LeagueTable standings={mockStandings} />);
    
    expect(screen.getByText('Team A')).toBeDefined();
    // Use getAllByText for values that might appear multiple times (like points, gf, gd)
    expect(screen.getAllByText('25').length).toBeGreaterThan(0); // points/gf
    expect(screen.getAllByText('+20').length).toBeGreaterThan(0); // gd
    
    expect(screen.getByText('Team B')).toBeDefined();
    expect(screen.getAllByText('5').length).toBeGreaterThan(0); // points/gf
    expect(screen.getAllByText('-15').length).toBeGreaterThan(0); // gd
  });

  it('applies correct styling for top teams', () => {
    render(<LeagueTable standings={mockStandings} />);
    
    const teamARow = screen.getByText('Team A').closest('tr');
    expect(teamARow?.className).toContain('bg-blue-500/10');
  });

  it('applies correct styling for relegation teams', () => {
    render(<LeagueTable standings={mockStandings} />);
    
    const teamBRow = screen.getByText('Team B').closest('tr');
    expect(teamBRow?.className).toContain('bg-red-500/10');
  });
});
