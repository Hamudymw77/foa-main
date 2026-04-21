"use client"
import { Scorer, Defense } from "@/types"
import { Trophy, Shield, Medal, BarChart3, Activity } from "lucide-react"
import { TeamLogo } from "./TeamLogo"

interface StatisticsPanelProps {
  topScorers: Scorer[]
  bestDefense: Defense[]
  isLoading?: boolean
}

export function StatisticsPanel({ topScorers, bestDefense, isLoading = false }: StatisticsPanelProps) {
  // Calculate rankings with shared ranks for players with same goals
  const rankedScorers = topScorers.map((scorer, index) => {
    let rank = index + 1;
    if (index > 0 && scorer.goals === topScorers[index - 1].goals) {
      // Find the first occurrence of this goal count to get the shared rank
      let sharedRankIndex = index - 1;
      while (sharedRankIndex >= 0 && topScorers[sharedRankIndex].goals === scorer.goals) {
        rank = sharedRankIndex + 1;
        sharedRankIndex--;
      }
    }
    return { ...scorer, displayRank: rank };
  });

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case 2: return "text-secondary bg-white/10 border-white/20"
      case 3: return "text-amber-600 bg-amber-600/10 border-amber-600/20"
      default: return "text-secondary bg-white/5 border-transparent"
    }
  }

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return "";
    
    // Special cases for UK nations
    if (countryCode === 'gb-eng') return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
    if (countryCode === 'gb-sct') return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
    if (countryCode === 'gb-wls') return "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
    
    try {
      const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch (e) {
      return "";
    }
  };

  if (isLoading) {
    return (
        <div className="grid md:grid-cols-2 gap-8 mb-8 animate-pulse">
            <div className="bg-white/5 h-96 glass-card"></div>
            <div className="bg-white/5 h-96 glass-card"></div>
        </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-8 animate-in fade-in duration-500">
      {/* Top Scorers Card */}
      <div className="glass-card overflow-hidden shadow-lg">
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Top Scorers 25/26</h3>
          </div>
        </div>
        
        <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-secondary uppercase tracking-wider">
                  <th className="px-3 py-3 text-center w-12 min-w-[48px]">#</th>
                  <th className="px-3 py-3 min-w-[160px]">Player</th>
                  <th className="px-3 py-3 text-center min-w-[70px]">Goals</th>
                  <th className="px-3 py-3 text-center min-w-[70px]">Assists</th>
                  <th className="px-3 py-3 text-center min-w-[70px]">Played</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rankedScorers.map((scorer) => (
                  <tr 
                    key={scorer.id || scorer.name} 
                    className="group hover:bg-white/10 transition-all duration-300 relative"
                  >
                    <td className="px-3 py-4 text-center">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm border mx-auto ${getRankStyle(scorer.displayRank)}`}>
                        {scorer.displayRank}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <TeamLogo teamName={scorer.team} className="w-8 h-8 shrink-0 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-extrabold text-white text-base tracking-tight drop-shadow-sm group-hover:text-accent transition-colors truncate">
                              {scorer.name}
                            </span>
                            {scorer.countryCode && (
                              <span 
                                className="text-lg leading-none shrink-0" 
                                title={`Nationality: ${scorer.countryCode.toUpperCase()}`}
                                aria-label={`Flag of ${scorer.name}'s country`}
                              >
                                {getFlagEmoji(scorer.countryCode)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-secondary font-medium opacity-80 truncate">
                            {scorer.team}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="text-xl font-black text-white group-hover:text-accent transition-colors">
                        {scorer.goals}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="text-base font-bold text-secondary group-hover:text-white transition-colors">
                        {scorer.assists}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <span className="text-base font-bold text-secondary group-hover:text-white transition-colors">
                        {scorer.matchesPlayed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Team Statistics Card (formerly Best Defense) */}
      <div className="glass-card overflow-hidden shadow-lg">
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Team Statistics</h3>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {bestDefense.map((team, index) => (
            <div 
              key={team.team} 
              className="group flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
            >
              {/* Rank */}
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm border ${getRankStyle(index + 1)}`}>
                {index + 1}
              </div>

              {/* Team Info */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <TeamLogo 
                  teamName={team.team} 
                  url={team.logo} 
                  className="w-10 h-10 drop-shadow-md transition-transform group-hover:scale-110" 
                />
                <div>
                  <div className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {team.team}
                  </div>
                  <div className="text-sm text-secondary flex items-center gap-3">
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-secondary" />
                        {team.cleanSheets} CS
                    </span>
                    {team.possession && (
                        <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3 text-secondary" />
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
                        <div className="text-[10px] font-bold text-secondary uppercase mt-0.5">
                        GF
                        </div>
                    </div>
                 )}
                 
                 <div className="text-center min-w-[40px]">
                    <div className="text-xl font-bold text-red-400">
                    {team.goalsAgainst}
                    </div>
                    <div className="text-[10px] font-bold text-secondary uppercase mt-0.5">
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
