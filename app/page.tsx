"use client"

import { useEffect } from "react"
import { LeagueTable } from "./components/LeagueTable"
import { StatisticsPanel } from "./components/StatisticsPanel"
import { MatchList } from "./components/MatchList"
import { useFootballData } from "./hooks/useFootballData"
import { useDashboardState } from "./hooks/useDashboardState"
import { useStatisticsData } from "./hooks/useStatisticsData"
import { SkeletonLoader } from "./components/SkeletonLoader"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { BackToTop } from "./components/BackToTop"

export default function PremierLeagueDashboard() {
  const { standings, matches, upcomingMatches, isLoading, lastUpdated } = useFootballData();
  const { topScorers, bestDefense } = useStatisticsData();
  const { 
    selectedMatchId, 
    setSelectedMatchId, 
    showStatistics, 
    setShowStatistics,
    handleSelectMatch 
  } = useDashboardState();

  useEffect(() => {
    if (!isLoading && (matches.length > 0 || upcomingMatches.length > 0) && selectedMatchId === "match-1") {
        const initialId = matches[0]?.id ?? upcomingMatches[0]?.id;
        if (initialId) setSelectedMatchId(initialId);
    }
  }, [isLoading, matches, upcomingMatches, selectedMatchId, setSelectedMatchId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header 
        showStatistics={showStatistics}
        setShowStatistics={setShowStatistics}
      />
        <div className="p-4 md:p-8 flex-1">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  const selectedMatch = [...matches, ...upcomingMatches].find((m) => m.id === selectedMatchId) || matches[0] || upcomingMatches[0] || {
    id: "loading",
    homeTeam: "Loading...",
    awayTeam: "Loading...",
    date: "",
    stadium: "",
    homeLogo: "",
    awayLogo: ""
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        showStatistics={showStatistics}
        setShowStatistics={setShowStatistics}
      />
      
      <main id="main" className="container mx-auto max-w-7xl px-4 md:px-8 flex-1">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-4">
            {/* Premier League Table */}
            <div id="standings" className="glass rounded-xl shadow-lg mb-8 p-6 scroll-mt-24">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                <h2 className="font-bold text-accent text-[clamp(1.5rem,3vw,2rem)]">
                  {showStatistics ? 'Season Statistics' : 'Premier League Table'}
                </h2>
              </div>

              {showStatistics && (
                <StatisticsPanel topScorers={topScorers} bestDefense={bestDefense} />
              )}

              {!showStatistics && (
                <LeagueTable standings={standings} lastUpdated={lastUpdated} />
              )}
            </div>

              {/* Anchor for Stats navigation */}
              <div id="stats" aria-hidden="true"></div>

              {/* Match List */}
              <div id="matches" aria-hidden="false"></div>
            <MatchList 
              matches={matches} 
              upcomingMatches={upcomingMatches} 
              selectedMatchId={selectedMatchId}
              onSelectMatch={handleSelectMatch}
            />
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6 mt-8 lg:mt-0">
             {/* Match Detail removed as requested */}

          </div>
        </div>
      </main>
      

      
      <Footer />
      <BackToTop />
    </div>
  )
}
