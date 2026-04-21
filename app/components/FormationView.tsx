import { useState } from "react"
import { User, X } from "lucide-react"
import { Match } from "@/types"
import { PlayerAvatar } from "./PlayerAvatar"

interface FormationViewProps {
  selectedMatch: Match
}

export function FormationView({ selectedMatch }: FormationViewProps) {
  const [previewPlayer, setPreviewPlayer] = useState<any>(null)

  // Helper to parse formation string into rows (GK + lines)
  const getFormationRows = (formation: string) => {
      const parts = (formation || '4-4-2').split('-').map(Number)
      return [1, ...parts] // Add GK
  }

  // Get players for a team (handles both flat array and legacy object formats if needed)
  const getTeamPlayers = (isHome: boolean) => {
      const players = isHome ? selectedMatch.homePlayers : selectedMatch.awayPlayers;
      
      if (Array.isArray(players)) return players;
      
      // Legacy format fallback (convert object to array)
      if (players && typeof players === 'object') {
          const p = players as any;
          return [...(p.gk || []), ...(p.def || []), ...(p.mid || []), ...(p.fwd || [])];
      }
      
      return [];
  }

  const renderPitch = (isHome: boolean) => {
      const teamName = isHome ? selectedMatch.homeTeam : selectedMatch.awayTeam;
      const formation = isHome ? (selectedMatch.homeFormation || '4-4-2') : (selectedMatch.awayFormation || '4-4-2');
      const players = getTeamPlayers(isHome);
      const rows = getFormationRows(formation);
      
      const pitchBg = isHome ? "bg-green-900/80" : "bg-slate-800/80";
      const playerBorder = isHome ? "border-accent" : "border-blue-500";
      const hoverColor = isHome ? "hover:bg-accent" : "hover:bg-blue-500";

      return (
          <div className="flex flex-col gap-4">
              <h4 className="text-center font-bold text-lg text-foreground">
                {teamName} - {formation} 
              </h4>

              <div className={`relative ${pitchBg} rounded-lg border border-white/10 overflow-hidden shadow-inner aspect-[2/3] md:aspect-[3/4]`}>
                  {/* Pitch Markings */}
                  <div className="absolute inset-4 border-2 border-white/20 rounded-sm pointer-events-none"></div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-t-0 border-white/20 pointer-events-none"></div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-b-0 border-white/20 pointer-events-none"></div>
                  <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-white/20 pointer-events-none"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full pointer-events-none"></div>

                  {/* Players Grid */}
                  <div className="absolute inset-0 flex flex-col justify-between py-6 px-3 sm:py-7 sm:px-4 md:py-8 md:px-4">
                      {rows.map((count, rowIdx) => (
                          <div key={rowIdx} className="flex justify-around items-center h-full">
                              {Array.from({ length: count }).map((_, colIdx) => {
                                  const prevCount = rows.slice(0, rowIdx).reduce((a, b) => a + b, 0)
                                  const globalIndex = prevCount + colIdx
                                  const player = players[globalIndex]
                                  
                                  if (!player) return <div key={globalIndex} className="w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14" />; // Empty slot placeholder

                                  return (
                                      <div 
                                          key={globalIndex}
                                          onClick={() => setPreviewPlayer(player)}
                                          className={`
                                              relative w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center 
                                              cursor-pointer transition-all duration-300 group z-10
                                              bg-slate-900 border-2 ${playerBorder} shadow-lg hover:scale-110
                                          `}
                                      >
                                          {player.photo ? (
                                              <div className="w-full h-full rounded-full overflow-hidden">
                                                  <PlayerAvatar 
                                                      name={player.name}
                                                      photoUrl={player.photo}
                                                      className="w-full h-full scale-110 translate-y-1"
                                                  />
                                              </div>
                                          ) : (
                                              <span className="text-xs font-bold text-white">{player.number || '?'}</span>
                                          )}
                                          
                                          <div className={`
                                              absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 
                                              bg-black/80 backdrop-blur text-white text-[9px] sm:text-[10px] font-bold 
                                              px-2 py-0.5 rounded-full whitespace-nowrap shadow-md z-20 
                                              ${hoverColor} hover:text-black transition-colors
                                          `}>
                                              {player.name ? player.name.split(' ').pop() : 'Player'}
                                          </div>
                                      </div>
                                  )
                              })}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        {renderPitch(true)}
        {renderPitch(false)}
      </div>

      {/* Player Preview Modal */}
      {previewPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-200" onClick={() => setPreviewPlayer(null)}>
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 relative shadow-[0_0_100px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setPreviewPlayer(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                  
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 to-black border-4 border-accent shadow-[0_0_50px_rgba(251,191,36,0.2)] overflow-hidden relative">
                      {previewPlayer.photo ? (
                          <img 
                              src={previewPlayer.photo} 
                              className="w-full h-full object-cover object-top scale-110 bg-slate-800"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://resources.premierleague.com/premierleague/photos/players/110x140/Photo-Missing.png';
                              }}
                          />
                      ) : (
                          <User className="w-20 h-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" />
                      )}
                  </div>
                  
                  <div className="text-center">
                      <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{previewPlayer.name}</h2>
                      <div className="text-accent font-mono text-2xl font-bold mb-6">#{previewPlayer.number || '?'}</div>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                          <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/5">{previewPlayer.position || 'Unknown'}</span>
                          <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/5">{previewPlayer.teamName || 'Team'}</span>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}
