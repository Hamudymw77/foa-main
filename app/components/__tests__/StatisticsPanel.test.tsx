import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatisticsPanel } from '../StatisticsPanel'
import { Scorer, Defense } from '@/types'

describe('StatisticsPanel', () => {
  const mockTopScorers: Scorer[] = [
    { 
        id: "1", 
        name: "Player 1", 
        team: "Team A", 
        goals: 10, 
        assists: 5, 
        countryCode: "gb-eng",
        matchesPlayed: 10,
        minutesPlayed: 900,
        goalsPerMatch: 1.0,
        flag: "🏳️" 
    },
    { 
        id: "2",
        name: "Player 2", 
        team: "Team B", 
        goals: 8, 
        assists: 3, 
        countryCode: "fr",
        matchesPlayed: 8,
        minutesPlayed: 720,
        goalsPerMatch: 1.0,
        flag: "🏳️" 
    },
  ]

  const mockBestDefense: Defense[] = [
    { team: "Defense A", logo: "/logo-a.png", goalsAgainst: 5, cleanSheets: 10, goalsFor: 20, possession: 55 },
    { team: "Defense B", logo: "/logo-b.png", goalsAgainst: 9, cleanSheets: 8, goalsFor: 15, possession: 45 },
  ]

  it('renders correctly', () => {
    render(<StatisticsPanel topScorers={mockTopScorers} bestDefense={mockBestDefense} />)
    
    // Check for section headers
    expect(screen.getByText('Top Scorers 25/26')).toBeDefined()
    expect(screen.getByText('Team Statistics')).toBeDefined()

    // Check for player names
    expect(screen.getByText('Player 1')).toBeDefined()
    expect(screen.getByText('Player 2')).toBeDefined()

    // Check for team names in defense section
    expect(screen.getByText('Defense A')).toBeDefined()
    expect(screen.getByText('Defense B')).toBeDefined()
  })

  it('displays correct statistics', () => {
    render(<StatisticsPanel topScorers={mockTopScorers} bestDefense={mockBestDefense} />)

    // Check goals
    expect(screen.getAllByText('10').length).toBeGreaterThan(0)
    
    // Check assists (value)
    expect(screen.getAllByText('5').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
    
    // Check clean sheets text (updated to CS)
    const cleanSheetsElements = screen.getAllByText(/CS/i)
    expect(cleanSheetsElements.length).toBeGreaterThan(0)
    
    // Check for new stats
    expect(screen.getAllByText(/GF/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/GA/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Poss./i).length).toBeGreaterThan(0)
  })

  it('has accessible flag elements', () => {
    render(<StatisticsPanel topScorers={mockTopScorers} bestDefense={mockBestDefense} />)
    
    const flagElement = screen.getByLabelText("Flag of Player 1's country")
    expect(flagElement).toBeDefined()
  })
})
