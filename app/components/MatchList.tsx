"use client"
import { Match } from "@/types"
import { useState } from "react"

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
  
  const teams = Array.from(new Set(allMatches.flatMap(m => [m.homeTeam, m.awayTeam]))).sort()
  const rounds = Array.from(new Set(allMatches.map(m => m.round).filter((r): r is number => typeof r === 'number'))).sort((a, b) => a - b)

  return (
    <div className="bg-slate-800 rounded-xl shadow-xl mb-8 p-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-600">
        <h2 className="text-3xl font-bold text-yellow-400">Zápasy</h2>
        <div className="flex items-center gap-3">
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg"
          >
            <option value="">Všechny týmy</option>
            {teams.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterRound ?? ''}
            onChange={(e) => setFilterRound(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg"
          >
            <option value="">Všechna kola</option>
            {rounds.map(r => (
              <option key={r} value={r}>{`Kolo ${r}`}</option>
            ))}
          </select>
          <div className="relative">
            <button
              onClick={() => setMatchesMenuOpen(!matchesMenuOpen)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              Zápasy
              <span className="text-xl">▾</span>
            </button>
            {matchesMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => {
                    setCenterListType('played')
                    setMatchesMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-t-lg ${centerListType === 'played' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  Odehrané zápasy
                </button>
                <button
                  onClick={() => {
                    setCenterListType('upcoming')
                    setMatchesMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-b-lg ${centerListType === 'upcoming' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
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
              className={`bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors text-left ${selectedMatchId === m.id ? 'ring-2 ring-orange-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-300">{m.date}</div>
                <div className={`text-[11px] px-2 py-0.5 rounded ${m.status === 'upcoming' ? 'bg-blue-600/30 text-blue-300' : 'bg-green-600/30 text-green-300'}`}>
                  {m.status === 'upcoming' ? 'UPCOMING' : 'KONEC'}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <img src={m.homeLogo || "/placeholder.svg"} alt={m.homeTeam} className="w-7 h-7" />
                  <span className="text-sm font-semibold truncate">{m.homeTeam}</span>
                </div>
                <div className="text-center font-bold">
                  {m.status === 'upcoming' ? '-' : `${m.homeScore} - ${m.awayScore}`}
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="text-sm font-semibold truncate">{m.awayTeam}</span>
                  <img src={m.awayLogo || "/placeholder.svg"} alt={m.awayTeam} className="w-7 h-7" />
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <span>{m.stadium}</span>
                {typeof m.round === 'number' && <span>• Kolo {m.round}/38</span>}
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}
