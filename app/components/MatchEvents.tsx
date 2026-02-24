"use client"
import { Match } from "@/types"

interface MatchEventsProps {
  selectedMatch: Match
}

export function MatchEvents({ selectedMatch }: MatchEventsProps) {
  if (!selectedMatch.events || selectedMatch.events.length === 0) {
    return (
      <div className="text-center text-secondary py-12 glass rounded-xl border border-white/10 animate-fade-in">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-lg">Match events are not available yet.</p>
        <p className="text-sm opacity-60">Check back later for live updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h4 className="text-xl font-bold text-accent mb-6 flex items-center gap-2">
        <span>⏱️</span> Match Timeline
      </h4>
      <div className="relative border-l-2 border-white/10 ml-3 md:ml-6 space-y-8 pl-8 py-2">
        {selectedMatch.events?.map((event, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline dot */}
            <div className={`absolute -left-[39px] md:-left-[41px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-background transition-all duration-300 group-hover:scale-125 ${
              event.type === 'goal' ? 'bg-green-500' :
              event.type === 'yellow' ? 'bg-yellow-500' :
              event.type === 'red' ? 'bg-red-500' :
              'bg-blue-500'
            }`}></div>
            
            <div className="glass-card p-4 rounded-lg flex items-center gap-4 transition-all duration-300 hover:translate-x-2">
              <span className="text-lg font-bold text-accent min-w-[3rem] text-center bg-white/5 rounded px-2 py-1">
                {event.minute}&apos;
              </span>
              
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-full">
                  <img
                    src={event.team === "home" ? selectedMatch.homeLogo : selectedMatch.awayLogo}
                    alt=""
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                    decoding="async"
                    width={24}
                    height={24}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {event.type === "goal" && <span className="text-xl">⚽</span>}
                    {event.type === "yellow" && <span className="text-xl">🟨</span>}
                    {event.type === "red" && <span className="text-xl">🟥</span>}
                    {event.type === "substitution" && <span className="text-xl">🔄</span>}
                    
                    <span className="font-extrabold text-white text-lg tracking-tight">
                      {event.type === "substitution" ? (
                        <span className="flex items-center gap-2">
                          <span className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">{event.playerIn}</span>
                          <span className="text-secondary/60 text-[10px] font-bold uppercase tracking-widest">IN</span>
                          <span className="text-secondary/40">/</span>
                          <span className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]">{event.playerOut}</span>
                          <span className="text-secondary/60 text-[10px] font-bold uppercase tracking-widest">OUT</span>
                        </span>
                      ) : (
                        event.player
                      )}
                    </span>
                  </div>
                  
                  {event.type === "goal" && event.assist && (
                    <div className="text-sm text-secondary ml-8">
                      Assist: <span className="text-foreground/80">{event.assist}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
