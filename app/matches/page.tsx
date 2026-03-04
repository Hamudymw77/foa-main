"use client"

import { useState, useEffect, useMemo } from "react"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { BackToTop } from "../components/BackToTop"
import { useFootballData } from "../hooks/useFootballData"
import { SkeletonLoader } from "../components/SkeletonLoader"
import { MatchCard } from "../components/MatchCard"
import { MatchesOverview } from "../components/MatchesOverview"
import { LeagueTable } from "../components/LeagueTable"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Match } from "@/types"

export default function MatchesPage() {
  const { matches: completedMatches, upcomingMatches, standings, isLoading, error, lastUpdated } = useFootballData()
  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'table'>('overview')

  const allMatches = useMemo(() => [...completedMatches, ...upcomingMatches], [completedMatches, upcomingMatches])
  
  // Extract unique gameweeks (rounds)
  const gameweeks = useMemo(() => {
    const rounds = new Set(allMatches.map(m => m.round).filter((r): r is number => typeof r === 'number'))
    return Array.from(rounds).sort((a, b) => a - b)
  }, [allMatches])

  // Determine current/next gameweek on initial load
  useEffect(() => {
    // Only run if we have data and haven't selected a gameweek yet
    if (!isLoading && selectedGameweek === null) {
        // Fallback for when no gameweeks are found from matches directly
        if (gameweeks.length === 0) {
            // Default to GW1 if absolutely no data found to avoid empty state confusion
            setSelectedGameweek(1); 
            return;
        }

      // 1. Try to find the first gameweek that has upcoming matches
      const upcomingRounds = upcomingMatches
        .map(m => m.round)
        .filter((r): r is number => typeof r === 'number')
        .sort((a, b) => a - b);
      
      let targetGw = upcomingRounds.length > 0 ? upcomingRounds[0] : undefined;

      // 2. If no upcoming matches, default to the last available gameweek
      if (targetGw === undefined) {
         targetGw = gameweeks[gameweeks.length - 1];
      }
      
      // 3. If we still don't have a target, just pick the very first one
      if (targetGw === undefined && gameweeks.length > 0) {
        targetGw = gameweeks[0];
      }

      if (targetGw !== undefined) {
        setSelectedGameweek(targetGw)
      }
    }
  }, [isLoading, gameweeks, upcomingMatches, selectedGameweek])

  // Filter matches by selected gameweek
  const filteredMatches = useMemo(() => {
    if (selectedGameweek === null) return []
    // Make strict comparison with String or Number to match potential string/number mismatch in data
    return allMatches.filter(m => Number(m.round) === Number(selectedGameweek))
      .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
  }, [allMatches, selectedGameweek])

  // Helper to get team form (last 5 matches)
  const getTeamForm = (teamName: string) => {
    return completedMatches
      .filter(m => m.homeTeam === teamName || m.awayTeam === teamName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(m => {
        const isHome = m.homeTeam === teamName
        const homeScore = m.homeScore ?? 0
        const awayScore = m.awayScore ?? 0
        
        if (homeScore === awayScore) return 'D'
        if (isHome) return homeScore > awayScore ? 'W' : 'L'
        return awayScore > homeScore ? 'W' : 'L'
      })
      .reverse()
  }

  const handlePrevGw = () => {
    if (selectedGameweek === null) return
    const currentIndex = gameweeks.indexOf(selectedGameweek)
    if (currentIndex > 0) {
      setSelectedGameweek(gameweeks[currentIndex - 1])
    }
  }

  const handleNextGw = () => {
    if (selectedGameweek === null) return
    const currentIndex = gameweeks.indexOf(selectedGameweek)
    if (currentIndex < gameweeks.length - 1) {
      setSelectedGameweek(gameweeks[currentIndex + 1])
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 md:px-8 py-8 flex-1 space-y-8">
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h1 className="text-4xl font-black text-white">Premier League</h1>
            
            {/* Gameweek Navigation - Only visible in Fixtures tab */}
            {!isLoading && activeTab === 'fixtures' && gameweeks.length > 0 && (
              <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10 animate-in fade-in duration-300">
                <button 
                  onClick={handlePrevGw}
                  disabled={selectedGameweek === gameweeks[0]}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  aria-label="Previous Gameweek"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col items-center min-w-[140px]">
                  <span className="text-xs text-secondary uppercase font-bold tracking-wider">Gameweek</span>
                  <span className="text-2xl font-black text-accent">{selectedGameweek}</span>
                </div>

                <button 
                  onClick={handleNextGw}
                  disabled={selectedGameweek === gameweeks[gameweeks.length - 1]}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-white"
                  aria-label="Next Gameweek"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Dashboard Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                activeTab === "overview"
                  ? "text-accent border-b-2 border-accent"
                  : "text-secondary hover:text-foreground hover:bg-white/5 rounded-t-lg"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("fixtures")}
              className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                activeTab === "fixtures"
                  ? "text-accent border-b-2 border-accent"
                  : "text-secondary hover:text-foreground hover:bg-white/5 rounded-t-lg"
              }`}
            >
              Fixtures & Results
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap ${
                activeTab === "table"
                  ? "text-accent border-b-2 border-accent"
                  : "text-secondary hover:text-foreground hover:bg-white/5 rounded-t-lg"
              }`}
            >
              Table
            </button>
          </div>
          
          {isLoading ? (
            <SkeletonLoader count={3} />
          ) : error ? (
            <div className="text-red-500 bg-red-500/10 p-4 rounded-lg">{(error as Error).message}</div>
          ) : (
            <div className="min-h-[400px]">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <MatchesOverview 
                  matches={completedMatches} 
                  upcomingMatches={upcomingMatches}
                  standings={standings}
                />
              )}

              {/* Fixtures Tab */}
              {activeTab === 'fixtures' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {filteredMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredMatches.map(match => (
                        <MatchCard 
                          key={match.id} 
                          match={match}
                          homeForm={getTeamForm(match.homeTeam)}
                          awayForm={getTeamForm(match.awayTeam)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                      <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">No matches found</h3>
                      <p className="text-secondary">No matches scheduled for Gameweek {selectedGameweek}.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Table Tab */}
              {activeTab === 'table' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                     <LeagueTable standings={standings} lastUpdated={lastUpdated} />
                   </div>
                 </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}