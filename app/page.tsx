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

export default function PremierLeagueDashboard() {
  const { standings, matches, upcomingMatches, isLoading } = useFootballData();
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
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-2xl font-bold animate-pulse">Loading data...</div>
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
    <div className="min-h-screen bg-slate-900 text-white p-5">
      <header className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-4xl md:text-6xl font-extrabold text-orange-500 tracking-tight">KICKGOAL</h1>
        </div>
        <h2 className="text-4xl font-bold text-white mt-2">PREMIER LEAGUE</h2>
        <p className="text-xl text-slate-300 mt-2">Match Statistics, Table & Schedule</p>
      </header>

      <main className="container mx-auto max-w-7xl">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-3">
            {/* Premier League Table */}
            <div className="bg-slate-800 rounded-xl shadow-xl mb-8 p-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-600">
                <h2 className="text-3xl font-bold text-yellow-400">Premier League Table</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTransfers(!showTransfers)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    {showTransfers ? "Hide Transfers" : "Transfers"}
                  </button>
                  <button
                    onClick={() => setShowStatistics(!showStatistics)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
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

              <LeagueTable standings={standings} />
            </div>

            {/* Match List */}
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
    </div>
  )
}
