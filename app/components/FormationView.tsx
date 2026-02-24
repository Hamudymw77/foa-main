"use client"
import { Match } from "@/types"

interface FormationViewProps {
  selectedMatch: Match
  showPredicted: boolean
  setShowPredicted: (show: boolean) => void
}

export function FormationView({ selectedMatch, showPredicted, setShowPredicted }: FormationViewProps) {
  return (
    <div className="space-y-6">
      {/* Toggle for Predicted Lineups */}
      <div className="flex justify-center mb-4">
        <div className="bg-white/5 p-1 rounded-lg flex gap-1 border border-white/10">
          <button
            onClick={() => setShowPredicted(false)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              !showPredicted ? "bg-accent text-slate-900 shadow-lg" : "text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            Actual Lineup
          </button>
          <button
            onClick={() => setShowPredicted(true)}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
              showPredicted ? "bg-accent text-slate-900 shadow-lg" : "text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            Predicted Lineup
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Home Team Formation */}
        <div className="glass rounded-lg p-4 border border-white/10">
          <h4 className="text-center font-bold mb-4 text-lg text-foreground">
            {selectedMatch.homeTeam} - {selectedMatch.homeFormation} 
            {showPredicted && <span className="text-accent text-sm ml-2">(Predicted)</span>}
          </h4>
          <div className="relative bg-green-900/40 rounded-lg border border-white/5" style={{ height: "400px" }}>
            {/* Field markings */}
            <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-16 border-2 border-white/30 border-t-0" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
            </div>

            {/* Goalkeeper */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-bold text-xs mb-1 text-slate-900 shadow-lg shadow-accent/20">
                GK
              </div>
              <div className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded border border-white/20 shadow-sm">
                {(((showPredicted || !selectedMatch.homePlayers) ? selectedMatch.predictedHomePlayers : selectedMatch.homePlayers) ?? { gk: [], def: [], mid: [], fwd: [] }).gk[0]}
              </div>
            </div>

            {/* Defenders */}
            <div className="absolute top-24 left-0 right-0 flex justify-around px-4">
              {(((showPredicted || !selectedMatch.homePlayers) ? selectedMatch.predictedHomePlayers : selectedMatch.homePlayers) ?? { gk: [], def: [], mid: [], fwd: [] }).def.map((player, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-xs mb-1 text-slate-900 shadow-md shadow-accent/20">
                    D
                  </div>
                  <div className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded max-w-[70px] truncate border border-white/20 shadow-sm">
                    {player}
                  </div>
                </div>
              ))}
            </div>

            {/* Midfielders */}
            <div className="absolute top-52 left-0 right-0 flex justify-around px-4">
              {(((showPredicted || !selectedMatch.homePlayers) ? selectedMatch.predictedHomePlayers : selectedMatch.homePlayers) ?? { gk: [], def: [], mid: [], fwd: [] }).mid.map((player, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-xs mb-1 text-slate-900 shadow-md shadow-accent/20">
                    M
                  </div>
                  <div className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded max-w-[70px] truncate border border-white/20 shadow-sm">
                    {player}
                  </div>
                </div>
              ))}
            </div>

            {/* Forwards */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-around px-4">
              {(((showPredicted || !selectedMatch.homePlayers) ? selectedMatch.predictedHomePlayers : selectedMatch.homePlayers) ?? { gk: [], def: [], mid: [], fwd: [] }).fwd.map((player, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-xs mb-1 text-slate-900 shadow-md shadow-accent/20">
                    F
                  </div>
                  <div className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded max-w-[70px] truncate border border-white/20 shadow-sm">
                    {player}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Away Team Formation */}
        <div className="glass-card rounded-lg p-4 border border-white/10">
          <h4 className="text-center font-bold mb-4 text-lg text-foreground">
            {selectedMatch.awayTeam} - {selectedMatch.awayFormation}
            {showPredicted && <span className="text-primary text-sm ml-2">(Predicted)</span>}
          </h4>
          <div className="relative bg-green-900/40 rounded-lg border border-white/5" style={{ height: "400px" }}>
            {/* Field markings */}
            <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-16 border-2 border-white/30 border-t-0" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
            </div>

            {/* Goalkeeper */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-xs mb-1 text-white shadow-lg shadow-primary/20">
                GK
              </div>
              <div className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded border border-white/20 shadow-sm">
                {(((showPredicted || !selectedMatch.awayPlayers) ? selectedMatch.predictedAwayPlayers : selectedMatch.awayPlayers) ?? { gk: [], def: [], mid: [], fwd: [] }).gk[0]}
              </div>
            </div>

            {/* Defenders */}
            <div className="absolute top-24 left-0 right-0 flex justify-around px-4">
              {(((showPredicted || !selectedMatch.awayPlayers) ? selectedMatch.predictedAwayPlayers : selectedMatch.awayPlayers) ?? { gk: [], def: [], mid: [], fwd: [] }).def.map((player, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-xs mb-1 text-white shadow-md shadow-primary/20">
                    D
                  </div>
                  <div className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded max-w-[70px] truncate border border-white/20 shadow-sm">
                    {player}
                  </div>
                </div>
              ))}
            </div>

            {/* Midfielders */}
            <div className="absolute top-52 left-0 right-0 flex justify-around px-4">
              {(((showPredicted || !selectedMatch.awayPlayers) ? selectedMatch.predictedAwayPlayers : selectedMatch.awayPlayers) ?? { gk: [], def: [], mid: [], fwd: [] }).mid.map((player, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-xs mb-1 text-white shadow-md shadow-primary/20">
                    M
                  </div>
                  <div className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded max-w-[70px] truncate border border-white/20 shadow-sm">
                    {player}
                  </div>
                </div>
              ))}
            </div>

            {/* Forwards */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-around px-4">
              {(((showPredicted || !selectedMatch.awayPlayers) ? selectedMatch.predictedAwayPlayers : selectedMatch.awayPlayers) ?? { gk: [], def: [], mid: [], fwd: [] }).fwd.map((player, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-xs mb-1 text-white shadow-md shadow-primary/20">
                    F
                  </div>
                  <div className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-white px-1.5 py-0.5 rounded max-w-[70px] truncate border border-white/20 shadow-sm">
                    {player}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
