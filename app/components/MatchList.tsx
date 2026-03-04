"use client"
import { Match } from "@/types"
import { useState } from "react"
import { ChevronDown, Calendar, Filter } from "lucide-react"
import { MatchCard } from "./MatchCard"

interface MatchListProps {
  matches: Match[]
  upcomingMatches: Match[]
  selectedMatchId: string
  // onSelectMatch už není potřeba pro navigaci, ale ponecháme v props, pokud ho vyžadují jiné komponenty
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
      .reverse()
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
            <MatchCard
                key={m.id}
                match={m}
                selectedMatchId={selectedMatchId}
                homeForm={getTeamForm(m.homeTeam)}
                awayForm={getTeamForm(m.awayTeam)}
            />
          ))}
      </div>
    </div>
  )
}