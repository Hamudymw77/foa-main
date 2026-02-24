"use client"
import { Scorer, Defense } from "@/types"
import { Trophy, Shield, Medal, BarChart3, Activity } from "lucide-react"

interface StatisticsPanelProps {
  topScorers: Scorer[]
  bestDefense: Defense[]
  isLoading?: boolean
}

export function StatisticsPanel({ topScorers, bestDefense, isLoading = false }: StatisticsPanelProps) {
  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case 1: return "text-slate-300 bg-slate-300/10 border-slate-300/20"
      case 2: return "text-amber-600 bg-amber-600/10 border-amber-600/20"
      default: return "text-slate-400 bg-slate-700/30 border-transparent"
    }
  }

  if (isLoading) {
    return (
        <div className="grid md:grid-cols-2 gap-8 mb-8 animate-pulse">
            <div className="bg-slate-800 h-96 rounded-xl"></div>
            <div className="bg-slate-800 h-96 rounded-xl"></div>
        </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-8 animate-in fade-in duration-500">
      {/* Top Scorers Card */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Top Scorers 25/26</h3>
          </div>
        </div>
        
        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {topScorers.map((scorer, index) => (
            <div 
              key={scorer.id || scorer.name} 
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 transition-all duration-300 border border-transparent hover:border-slate-600/50"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Rank */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm border shrink-0 ${getRankStyle(index)}`}>
                  {index + 1}
                </div>
              </div>
              {/* Player Info */}
              <div className="flex-1 min-w-0 w-full sm:w-auto mt-2 sm:mt-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-100 truncate group-hover:text-orange-400 transition-colors text-lg">
                    {scorer.name}
                  </span>
                </div>
                <div className="text-sm text-slate-400 truncate flex items-center gap-2">
                    <span>{scorer.team}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-slate-700/50 pt-2 sm:pt-0">
                
                <div className="text-center min-w-[60px]">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Matches</div>
                    <div className="text-sm font-medium text-slate-300">
                        {scorer.matchesPlayed}
                    </div>
                </div>

                <div className="text-center min-w-[60px]">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Assists</div>
                    <div className="text-sm font-medium text-slate-300">
                        {scorer.assists}
                    </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <div className="flex items-center justify-end gap-1.5 text-2xl font-bold text-white">
                    <span>{scorer.goals}</span>
                    <span className="text-xs text-slate-500 font-normal self-end mb-1 ml-1">Goals</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Statistics Card (formerly Best Defense) */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Team Statistics</h3>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {bestDefense.map((team, index) => (
            <div 
              key={team.team} 
              className="group flex items-center gap-4 p-3 rounded-lg hover:bg-slate-700/50 transition-all duration-300 border border-transparent hover:border-slate-600/50"
            >
              {/* Rank */}
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm border ${getRankStyle(index)}`}>
                {index + 1}
              </div>

              {/* Team Info */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <img 
                  src={team.logo || "/placeholder.svg"} 
                  alt={team.team} 
                  className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-110" 
                />
                <div>
                  <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {team.team}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-slate-500" />
                        {team.cleanSheets} CS
                    </span>
                    {team.possession && (
                        <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-slate-500" />
                            {team.possession}% Poss.
                        </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex gap-4 shrink-0">
                 {team.goalsFor !== undefined && (
                    <div className="text-center min-w-[40px]">
                        <div className="text-xl font-bold text-green-400">
                        {team.goalsFor}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        GF
                        </div>
                    </div>
                 )}
                 
                 <div className="text-center min-w-[40px]">
                    <div className="text-xl font-bold text-red-400">
                    {team.goalsAgainst}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                    GA
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
