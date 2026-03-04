"use client"
import { Match } from "@/types"

interface RecentResultsProps {
  matches: Match[]
  selectedMatchId: string
  onSelectMatch: (id: string) => void
}

export function RecentResults({ matches, selectedMatchId, onSelectMatch }: RecentResultsProps) {
  const matchesByRound = matches.reduce((acc: Record<string, Match[]>, m: Match) => {
    const r = (m.round ?? 0).toString();
    acc[r] = acc[r] || [];
    acc[r].push(m);
    return acc;
  }, {})

  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="glass rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-accent mb-4">Recent Results</h3>
      <div className="space-y-5">
        {sortedRounds.map((round) => {
          const roundMatches = matches
            .filter((m) => (m.round ?? 0) === round)
            .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
          return (
            <div key={`round-${round}`} className="space-y-3">
              <div className="text-sm font-bold text-secondary">
                Hrací den {round}/38
              </div>
              {roundMatches.map((match) => (
                <button
                  key={match.id}
                  onClick={() => onSelectMatch(match.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors border ${
                    selectedMatchId === match.id 
                      ? "bg-accent text-white border-accent" 
                      : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={match.homeLogo || "/placeholder.svg"} alt={match.homeTeam} className="w-6 h-6 shrink-0" />
                      <span className="text-sm font-semibold truncate">{match.homeTeam}</span>
                    </div>
                    <span className="font-bold text-lg whitespace-nowrap px-2">
                      {match.homeScore} - {match.awayScore}
                    </span>
                    <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                      <span className="text-sm font-semibold truncate">{match.awayTeam}</span>
                      <img src={match.awayLogo || "/placeholder.svg"} alt={match.awayTeam} className="w-6 h-6 shrink-0" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}