"use client"

import { useState, useMemo } from "react"
import { Header } from "../components/Header"
import { Footer } from "../components/Footer"
import { BackToTop } from "../components/BackToTop"
import { useStatisticsData } from "../hooks/useStatisticsData"
import { Trophy, Shield, Activity, Target, TrendingUp, Users } from "lucide-react"
import { TeamLogo } from "../components/TeamLogo"
import { proxifyImageUrl } from "../lib/imageProxy"

export default function StatsPage() {
  const { playerStats, bestDefense, isLoading } = useStatisticsData()
  const [activeTab, setActiveTab] = useState<'goals' | 'assists' | 'xg' | 'clean_sheets'>('goals')

  // --- DERIVED RANKINGS ---
  
  const topScorers = useMemo(() => {
    return [...playerStats]
      .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
      .slice(0, 10);
  }, [playerStats]);

  const topAssists = useMemo(() => {
    return [...playerStats]
      .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
      .slice(0, 10);
  }, [playerStats]);

  const topXG = useMemo(() => {
    return [...playerStats]
      .sort((a, b) => b.expected_goals - a.expected_goals)
      .slice(0, 10);
  }, [playerStats]);

  const topCleanSheets = useMemo(() => {
    return [...playerStats]
      // Filter for GK (1) and DEF (2)
      .filter(p => p.position === 1 || p.position === 2)
      .sort((a, b) => b.clean_sheets - a.clean_sheets || b.total_points - a.total_points)
      .slice(0, 10);
  }, [playerStats]);

  const activeData = useMemo(() => {
    switch(activeTab) {
        case 'goals': return { data: topScorers, label: 'Goals', valueKey: 'goals' as const, icon: Trophy, color: 'text-yellow-400' };
        case 'assists': return { data: topAssists, label: 'Assists', valueKey: 'assists' as const, icon: Users, color: 'text-blue-400' };
        case 'xg': return { data: topXG, label: 'xG', valueKey: 'expected_goals' as const, icon: Target, color: 'text-green-400' };
        case 'clean_sheets': return { data: topCleanSheets, label: 'Clean Sheets', valueKey: 'clean_sheets' as const, icon: Shield, color: 'text-purple-400' };
    }
  }, [activeTab, topScorers, topAssists, topXG, topCleanSheets]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-2 md:px-8 py-4 md:py-8 flex-1 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-black text-white mb-2">Season Stats</h1>
                <p className="text-secondary">Official Premier League Player Analytics</p>
            </div>
            
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto">
                {[
                    { id: 'goals', label: 'Top Scorers' },
                    { id: 'assists', label: 'Assists' },
                    { id: 'xg', label: 'Expected Goals' },
                    { id: 'clean_sheets', label: 'Clean Sheets' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap min-h-[48px] min-w-[48px] active:scale-95 transition-transform duration-150 ${
                            activeTab === tab.id 
                                ? 'bg-white text-slate-900 shadow-lg' 
                                : 'text-secondary hover:text-white hover:bg-white/5'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {isLoading ? (
            <div className="grid md:grid-cols-2 gap-8 animate-pulse">
                <div className="h-96 bg-white/5 rounded-2xl"></div>
                <div className="h-96 bg-white/5 rounded-2xl"></div>
            </div>
        ) : (
            <div className="space-y-8">
                {/* Main Leaderboard */}
                <div className="space-y-6">
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
                        <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-white/5 ${activeData.color}`}>
                                    <activeData.icon className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">{activeData.label} Leaders</h2>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-xs font-bold text-secondary uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3 py-3 md:px-6 md:py-4 text-center w-12 md:w-16">Rank</th>
                                        <th className="px-3 py-3 md:px-6 md:py-4">Player</th>
                                        <th className="px-3 py-3 md:px-6 md:py-4 text-center">Team</th>
                                        <th className="px-3 py-3 md:px-6 md:py-4 text-center w-24 md:w-32">{activeData.label}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeData.data.map((player, index) => (
                                        <tr key={player.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-3 py-3 md:px-6 md:py-4 text-center">
                                                <div className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full font-bold text-xs md:text-sm mx-auto ${
                                                    index === 0 ? 'bg-yellow-500 text-slate-900' :
                                                    index === 1 ? 'bg-slate-300 text-slate-900' :
                                                    index === 2 ? 'bg-amber-700 text-white' :
                                                    'bg-white/10 text-secondary'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4">
                                                <div className="flex items-center gap-2 md:gap-4">
                                                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 overflow-hidden border border-white/10 relative shrink-0">
                                                        <img 
                                                            src={proxifyImageUrl(player.photo)} 
                                                            alt={player.web_name}
                                                            className="w-full h-full object-cover object-top scale-110 translate-y-1"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = proxifyImageUrl('https://resources.premierleague.com/premierleague/photos/players/110x140/p0.png') || ''
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-white text-sm md:text-lg group-hover:text-accent transition-colors truncate">
                                                            {player.web_name}
                                                        </div>
                                                        <div className="text-[10px] md:text-xs text-secondary font-mono">
                                                            {player.position === 1 ? 'GKP' : 
                                                             player.position === 2 ? 'DEF' : 
                                                             player.position === 3 ? 'MID' : 'FWD'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <TeamLogo teamName={player.team} url={player.team_logo} className="w-6 h-6 md:w-8 md:h-8" />
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 md:px-6 md:py-4 text-center">
                                                <span className={`text-xl md:text-3xl font-black ${activeData.color}`}>
                                                    {player[activeData.valueKey]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        Best Defenses
                    </h3>
                    <div className="space-y-4">
                        {bestDefense.slice(0, 5).map((team, idx) => (
                            <div key={team.team} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="text-secondary font-mono text-sm">#{idx + 1}</span>
                                    <TeamLogo teamName={team.team} url={team.logo} className="w-8 h-8" />
                                    <span className="font-bold text-white text-sm">{team.team}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-blue-400">{team.cleanSheets}</span>
                                    <span className="text-[10px] text-secondary uppercase">Clean Sheets</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </main>

      <Footer />
      <BackToTop />
    </div>
  )
}
