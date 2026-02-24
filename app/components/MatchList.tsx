"use client"
import { Match } from "@/types"
import { useState } from "react"
import { ChevronDown, Calendar, Filter } from "lucide-react"
import { TeamLogo } from "./TeamLogo"

interface MatchListProps {
  matches: Match[]
  upcomingMatches: Match[]
  selectedMatchId: string
  onSelectMatch: (id: string, isUpcoming: boolean) => void
}

export function MatchList({ matches, upcomingMatches, selectedMatchId, onSelectMatch }: MatchListProps) {
  const [matchesMenuOpen, setMatchesMenuOpen] = useState(false)
  const [centerListType, setCenterListType] = useState<'played' | 'upcoming'>('played')
  const [filterTeam, setFilterTeam] = useState<string>('')
  const [filterRound, setFilterRound] = useState<number | undefined>(undefined)

  const activeMatches = centerListType === 'played' ? matches : upcomingMatches
  const allMatches = [...matches, ...upcomingMatches]
  const playedMatches = [...matches, ...upcomingMatches].filter(m => m.status === 'finished' || (m.homeScore !== undefined && m.awayScore !== undefined));
  
  const teams = Array.from(new Set(allMatches.flatMap(m => [m.homeTeam, m.awayTeam]))).sort()
  const rounds = Array.from(new Set(allMatches.map(m => m.round).filter((r): r is number => typeof r === 'number'))).sort((a, b) => a - b)

  const getTeamForm = (teamName: string) => {
    return playedMatches
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
      .reverse() // Show oldest to newest (left to right) or newest to oldest? Usually newest on right.
  }

  const renderFormDots = (teamName: string) => {
    const form = getTeamForm(teamName);
    return (
      <div className="flex gap-1 mt-1">
        {form.map((result, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full ${
              result === 'W' ? 'bg-green-500' : 
              result === 'L' ? 'bg-red-500' : 'bg-slate-400'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="glass rounded-xl shadow-lg mb-8 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 border-b border-white/10 pb-4">
        <h2 className="font-bold text-foreground tracking-tight flex items-center gap-2 text-[clamp(1.4rem,3vw,1.9rem)]">
            Zápasy
            <span className="text-sm font-normal text-secondary ml-2 bg-white/10 px-2 py-0.5 rounded-full">
                {activeMatches.length}
            </span>
        </h2>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Custom Select: Team */}
            <div className="relative group flex-1 md:flex-none">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Filter className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
                </div>
                <select
                    value={filterTeam}
                    onChange={(e) => setFilterTeam(e.target.value)}
                    className="w-full md:w-40 bg-white/5 border border-white/10 text-foreground text-sm rounded-lg pl-9 pr-8 py-3 appearance-none hover:border-accent/50 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 min-h-[44px]"
                >
                    <option value="" className="bg-slate-900">Všechny týmy</option>
                    {teams.map(t => (
                    <option key={t} value={t} className="bg-slate-900">{t}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-secondary" />
                </div>
            </div>

            {/* Custom Select: Round */}
            <div className="relative group flex-1 md:flex-none">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
                </div>
                <select
                    value={filterRound ?? ''}
                    onChange={(e) => setFilterRound(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full md:w-40 bg-white/5 border border-white/10 text-foreground text-sm rounded-lg pl-9 pr-8 py-3 appearance-none hover:border-accent/50 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 min-h-[44px]"
                >
                    <option value="" className="bg-slate-900">Všechna kola</option>
                    {rounds.map(r => (
                    <option key={r} value={r} className="bg-slate-900">{`Kolo ${r}`}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-secondary" />
                </div>
            </div>

          <div className="relative">
            <button
              onClick={() => setMatchesMenuOpen(!matchesMenuOpen)}
              className="bg-white hover:bg-gray-100 text-slate-900 font-bold py-2.5 px-6 rounded-lg transition-all shadow-lg shadow-black/10 flex items-center gap-2 text-sm min-h-[44px] min-w-[44px]"
            >
              {centerListType === 'played' ? 'Odehrané' : 'Nadcházející'}
              <ChevronDown className={`w-4 h-4 transition-transform ${matchesMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {matchesMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setCenterListType('played')
                    setMatchesMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${centerListType === 'played' ? 'bg-accent/10 text-accent font-medium' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  Odehrané zápasy
                </button>
                <button
                  onClick={() => {
                    setCenterListType('upcoming')
                    setMatchesMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${centerListType === 'upcoming' ? 'bg-accent/10 text-accent font-medium' : 'text-slate-300 hover:bg-white/5'}`}
                >
                  Nadcházející zápasy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeMatches
          .filter(m => !filterTeam || m.homeTeam === filterTeam || m.awayTeam === filterTeam)
          .filter(m => filterRound === undefined || m.round === filterRound)
          .map((m) => (
            <button
              key={m.id}
              onClick={() => onSelectMatch(m.id, m.status === 'upcoming')}
              className={`glass-card rounded-xl p-5 transition-all duration-300 text-left border ${selectedMatchId === m.id ? 'border-accent ring-1 ring-accent/50' : 'border-white/5 hover:border-white/10'} hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-medium text-secondary group-hover:text-foreground transition-colors">{m.date}</div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${m.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                  {m.status === 'upcoming' ? 'Upcoming' : 'Finished'}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <TeamLogo 
                    teamName={m.homeTeam} 
                    url={m.homeLogo} 
                    className="w-12 h-12 drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                  />
                  <div className="text-center w-full">
                    <span className="block text-sm font-bold text-slate-200 group-hover:text-white transition-colors leading-tight mb-1 break-words">{m.homeTeam}</span>
                    <div className="flex justify-center">{renderFormDots(m.homeTeam)}</div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center justify-center min-w-[80px] relative z-10 bg-slate-900/50 rounded-lg py-2 px-1">
                  <div className={`text-3xl font-black tracking-tighter ${m.status === 'upcoming' ? 'text-slate-600' : 'text-white'}`}>
                    {m.status === 'upcoming' ? (
                        <span className="text-2xl text-slate-500 font-bold">VS</span>
                    ) : (
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-4xl">{m.homeScore}</span>
                            <span className="text-secondary text-2xl mx-0.5">:</span>
                            <span className="text-4xl">{m.awayScore}</span>
                        </div>
                    )}
                  </div>
                  {m.status !== 'upcoming' && (
                    <div className="text-[10px] font-bold text-secondary mt-1 uppercase tracking-wider">Full Time</div>
                  )}
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                  <TeamLogo 
                    teamName={m.awayTeam} 
                    url={m.awayLogo} 
                    className="w-12 h-12 drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                  />
                  <div className="text-center w-full">
                    <span className="block text-sm font-bold text-slate-200 group-hover:text-white transition-colors leading-tight mb-1 break-words">{m.awayTeam}</span>
                    <div className="flex justify-center">{renderFormDots(m.awayTeam)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-slate-400 transition-colors">
                <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {m.stadium}
                </span>
                {typeof m.round === 'number' && (
                    <span className="font-medium bg-slate-800 px-2 py-0.5 rounded text-slate-400">R{m.round}</span>
                )}
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}
