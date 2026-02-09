"use client"
import { Match } from "@/types"

interface UpcomingMatchesProps {
  upcomingMatches: Match[]
  selectedMatchId: string
  onSelectMatch: (id: string) => void
}

export function UpcomingMatches({ upcomingMatches, selectedMatchId, onSelectMatch }: UpcomingMatchesProps) {
  return (
    <div className="bg-slate-800 rounded-xl shadow-xl p-6">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4">Upcoming Matches</h3>
      <div className="space-y-3">
        {upcomingMatches.map((match) => (
          <button
            key={match.id}
            onClick={() => onSelectMatch(match.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedMatchId === match.id ? "bg-orange-500" : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            <div className="text-xs text-slate-300 mb-2">{match.date}</div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <img src={match.homeLogo || "/placeholder.svg"} alt={match.homeTeam} className="w-6 h-6" />
                <span className="text-sm font-semibold truncate">{match.homeTeam}</span>
              </div>
              <span className="font-bold text-slate-400">-</span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="text-sm font-semibold truncate">{match.awayTeam}</span>
                <img src={match.awayLogo || "/placeholder.svg"} alt={match.awayTeam} className="w-6 h-6" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
