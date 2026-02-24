"use client"
import { useState, useEffect } from "react"
import { Medal, ThumbsUp, User } from "lucide-react"

interface Candidate {
  id: string
  name: string
  team: string
  image?: string
  votes: number
}

const INITIAL_CANDIDATES: Candidate[] = [
  { id: "1", name: "Erling Haaland", team: "Man City", votes: 45 },
  { id: "2", name: "Mohamed Salah", team: "Liverpool", votes: 38 },
  { id: "3", name: "Bukayo Saka", team: "Arsenal", votes: 32 },
  { id: "4", name: "Cole Palmer", team: "Chelsea", votes: 28 },
]

export function PlayerOfTheDay() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [votedId, setVotedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load data from localStorage on mount
    const savedVotes = localStorage.getItem("potd_candidates")
    const savedUserVote = localStorage.getItem("potd_user_vote")
    
    if (savedVotes) {
      setCandidates(JSON.parse(savedVotes))
    } else {
      setCandidates(INITIAL_CANDIDATES)
    }

    if (savedUserVote) {
      setHasVoted(true)
      setVotedId(savedUserVote)
    }

    setIsLoading(false)
  }, [])

  const handleVote = (id: string) => {
    if (hasVoted) return

    const updatedCandidates = candidates.map(c => 
      c.id === id ? { ...c, votes: c.votes + 1 } : c
    )

    setCandidates(updatedCandidates)
    setHasVoted(true)
    setVotedId(id)

    // Save to localStorage
    localStorage.setItem("potd_candidates", JSON.stringify(updatedCandidates))
    localStorage.setItem("potd_user_vote", id)
  }

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0)

  if (isLoading) return <div className="h-64 bg-slate-800/50 rounded-xl animate-pulse"></div>

  return (
    <div className="glass rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Medal className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Player of the Day</h3>
          <p className="text-sm text-secondary">Vote for the best performance</p>
        </div>
      </div>

      <div className="space-y-4">
        {candidates.map((candidate) => {
          const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
          const isSelected = votedId === candidate.id

          return (
            <div 
              key={candidate.id}
              className={`relative overflow-hidden rounded-lg border transition-all duration-300 ${
                hasVoted 
                  ? isSelected 
                    ? "border-accent/50 bg-accent/10" 
                    : "border-white/5 bg-white/5 opacity-75"
                  : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
              }`}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <div 
                  className="absolute inset-0 bg-accent/10 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected ? "bg-accent text-slate-900" : "bg-slate-700 text-slate-300"
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white text-lg tracking-tight group-hover:text-accent transition-colors">{candidate.name}</div>
                    <div className="text-xs text-secondary font-medium opacity-80">{candidate.team}</div>
                  </div>
                </div>

                {hasVoted ? (
                  <div className="text-right">
                    <div className="text-xl font-bold text-accent">{percentage}%</div>
                    <div className="text-xs text-secondary">{candidate.votes} votes</div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVote(candidate.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-accent text-foreground hover:text-white text-sm font-semibold rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Vote
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {hasVoted && (
        <div className="mt-4 text-center text-sm text-secondary animate-in fade-in">
          Thanks for voting! Come back tomorrow for new candidates.
        </div>
      )}
    </div>
  )
}
