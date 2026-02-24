"use client"
import { Match } from "@/types"

interface UpcomingMatchesProps {
  upcomingMatches: Match[]
  selectedMatchId: string
  onSelectMatch: (id: string) => void
}

export function UpcomingMatches({ upcomingMatches, selectedMatchId, onSelectMatch }: UpcomingMatchesProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-2xl font-bold text-accent mb-4">Upcoming Matches</h3>
      <div className="space-y-3">
        {upcomingMatches.map((match) => (
          <button
            key={match.id}
            onClick={() => onSelectMatch(match.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors border ${
              selectedMatchId === match.id 
                ? "bg-accent text-white border-accent" 
                : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-foreground"
            }`}
          >
            <div className={`text-xs mb-2 ${selectedMatchId === match.id ? "text-white/80" : "text-secondary"}`}>{match.date}</div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img src={match.homeLogo || "/placeholder.svg"} alt={match.homeTeam} className="w-6 h-6 shrink-0" loading="lazy" decoding="async" width={24} height={24} />
                <span className="text-sm font-semibold truncate">{match.homeTeam}</span>
              </div>
              <span className={`font-bold ${selectedMatchId === match.id ? "text-white/80" : "text-secondary"}`}>-</span>
              <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                <span className="text-sm font-semibold truncate">{match.awayTeam}</span>
                <img src={match.awayLogo || "/placeholder.svg"} alt={match.awayTeam} className="w-6 h-6 shrink-0" loading="lazy" decoding="async" width={24} height={24} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
