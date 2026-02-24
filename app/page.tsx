"use client"

import { useEffect } from "react"
import { LeagueTable } from "./components/LeagueTable"
import { StatisticsPanel } from "./components/StatisticsPanel"
import { TransfersPanel } from "./components/TransfersPanel"
import { MatchList } from "./components/MatchList"
import { RecentResults } from "./components/RecentResults"
import { UpcomingMatches } from "./components/UpcomingMatches"
import { MatchDetail } from "./components/MatchDetail"
import { PlayerOfTheDay } from "./components/PlayerOfTheDay"
import { useFootballData } from "./hooks/useFootballData"
import { useDashboardState } from "./hooks/useDashboardState"
import { useStatisticsData } from "./hooks/useStatisticsData"
import { useTransferData } from "./hooks/useTransferData"
import { SkeletonLoader } from "./components/SkeletonLoader"
import { Header } from "./components/Header"
import { Footer } from "./components/Footer"
import { BackToTop } from "./components/BackToTop"

export default function PremierLeagueDashboard() {
  const { standings, matches, upcomingMatches, isLoading, lastUpdated } = useFootballData();
  const { topScorers, bestDefense } = useStatisticsData();
  const { transfers, isLoading: transfersLoading } = useTransferData();
  const { 
    selectedMatchId, 
    setSelectedMatchId, 
    activeTab, 
    setActiveTab, 
    showStatistics, 
    setShowStatistics,
    showTransfers,
    setShowTransfers, 
    showPredicted, 
    setShowPredicted, 
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
        <Header />
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
      <Header />
      
      <main id="main" className="container mx-auto max-w-7xl px-4 md:px-8 flex-1">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-3">
            {/* Premier League Table */}
            <div id="standings" className="glass rounded-xl shadow-lg mb-8 p-6 scroll-mt-24">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                <h2 className="font-bold text-accent text-[clamp(1.5rem,3vw,2rem)]">Premier League Table</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTransfers(!showTransfers)}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  >
                    {showTransfers ? "Hide Transfers" : "Transfers"}
                  </button>
                  <button
                    onClick={() => setShowStatistics(!showStatistics)}
                    className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-6 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  >
                    {showStatistics ? "Hide Statistics" : "Show Statistics"}
                  </button>
                </div>
              </div>

              {showStatistics && (
                <StatisticsPanel topScorers={topScorers} bestDefense={bestDefense} />
              )}

              {showTransfers && (
                <TransfersPanel transfers={transfers} isLoading={transfersLoading} />
              )}

              {!showStatistics && !showTransfers && (
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
             {/* Match Detail */}
             <MatchDetail 
                selectedMatch={selectedMatch}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                showPredicted={showPredicted}
                setShowPredicted={setShowPredicted}
             />

             {/* Player of the Day */}
             <PlayerOfTheDay />

            {/* Recent Results */}
            <RecentResults 
              matches={matches} 
              selectedMatchId={selectedMatchId} 
              onSelectMatch={(id) => handleSelectMatch(id, false)} 
            />

            {/* Upcoming Matches */}
            <UpcomingMatches 
              upcomingMatches={upcomingMatches} 
              selectedMatchId={selectedMatchId} 
              onSelectMatch={(id) => handleSelectMatch(id, true)} 
            />
          </div>
        </div>
      </main>
      
      {/* Mobile CTA: prominent accessible button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('matches');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-accent text-slate-900 font-extrabold px-5 py-3 rounded-full shadow-lg shadow-amber-300/30 hover:shadow-amber-300/50 transition-all min-h-[48px] min-w-[48px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Přejít na zápasy (živé skóre)"
        >
          Živé skóre
        </button>
      </div>
      
      <Footer />
      <BackToTop />
    </div>
  )
}
