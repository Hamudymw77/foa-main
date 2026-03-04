"use client"

import { Match, TeamStanding } from "@/types"
import { TeamLogo } from "./TeamLogo"
import { MatchCard } from "./MatchCard"
import { ArrowUpRight, TrendingUp, Calendar, Trophy, Download } from "lucide-react"

interface MatchesOverviewProps {
  matches: Match[]
  upcomingMatches: Match[]
  standings: TeamStanding[]
}

export function MatchesOverview({ matches, upcomingMatches, standings }: MatchesOverviewProps) {
  // --- Derived Metrics ---
  const totalMatchesPlayed = matches.length
  const totalGoals = matches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0)
  const avgGoals = totalMatchesPlayed > 0 ? (totalGoals / totalMatchesPlayed).toFixed(2) : "0.00"
  
  // Recent Form (Last 5 finished matches)
  const recentMatches = [...matches]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 3)

  // Next Fixtures (Next 3 upcoming)
  const nextFixtures = [...upcomingMatches]
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    .slice(0, 3)

  // Top Teams (Top 3)
  const topTeams = [...standings].sort((a, b) => a.pos - b.pos).slice(0, 3)

  // Function to export matches to CSV
  const handleExportCSV = () => {
    const headers = ["Date", "Home Team", "Away Team", "Score", "Status", "Round"]
    const rows = matches.map(m => [
      m.date,
      m.homeTeam,
      m.awayTeam,
      `${m.homeScore}-${m.awayScore}`,
      m.status,
      m.round
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "matches_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Export */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent" />
          Season Overview
        </h2>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-secondary hover:text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>
          <p className="text-secondary text-sm font-medium uppercase tracking-wider">Matches Played</p>
          <div className="text-4xl font-black text-white mt-2">{totalMatchesPlayed}</div>
          <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Season in progress
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-secondary text-sm font-medium uppercase tracking-wider">Total Goals</p>
          <div className="text-4xl font-black text-white mt-2">{totalGoals}</div>
          <div className="mt-2 text-xs text-blue-400">
            {avgGoals} goals per match
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Calendar className="w-16 h-16 text-purple-500" />
          </div>
          <p className="text-secondary text-sm font-medium uppercase tracking-wider">Upcoming Games</p>
          <div className="text-4xl font-black text-white mt-2">{upcomingMatches.length}</div>
          <div className="mt-2 text-xs text-purple-400">
            Scheduled fixtures
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Teams Table */}
        <div className="glass-card rounded-xl p-6 border border-white/5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            League Leaders
          </h3>
          <div className="space-y-3">
            {topTeams.map((team, index) => (
              <div key={team.team} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-slate-300 text-black' : 
                    'bg-orange-700 text-white'
                  }`}>
                    {team.pos}
                  </span>
                  <TeamLogo teamName={team.team} url={team.logo} className="w-8 h-8" />
                  <span className="font-bold text-white">{team.team}</span>
                </div>
                <div className="text-right">
                  <span className="block font-black text-accent">{team.points} pts</span>
                  <span className="text-xs text-secondary">{team.played} MP</span>
                </div>
              </div>
            ))}
            {topTeams.length === 0 && <div className="text-secondary text-center py-4">No standings data available</div>}
          </div>
        </div>

        {/* Recent Form / Trends */}
        <div className="glass-card rounded-xl p-6 border border-white/5">
           <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-green-500" />
            Recent Results
          </h3>
          <div className="space-y-3">
            {recentMatches.length > 0 ? (
                recentMatches.map(match => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-bold text-white truncate w-24 text-right">{match.homeTeam}</span>
                            <div className="px-2 py-1 bg-slate-900 rounded text-xs font-mono text-accent">
                                {match.homeScore}-{match.awayScore}
                            </div>
                            <span className="text-xs font-bold text-white truncate w-24">{match.awayTeam}</span>
                        </div>
                        <div className="text-[10px] text-secondary ml-2">{match.date}</div>
                    </div>
                ))
            ) : (
                <div className="text-secondary text-center py-4">No recent matches</div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Fixtures Highlight */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Next Fixtures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nextFixtures.map(match => (
                <MatchCard key={match.id} match={match} />
            ))}
            {nextFixtures.length === 0 && (
                <div className="col-span-3 text-center py-8 bg-white/5 rounded-xl text-secondary">
                    No upcoming fixtures scheduled
                </div>
            )}
        </div>
      </div>

    </div>
  )
}