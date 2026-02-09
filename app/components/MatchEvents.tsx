"use client"
import { Match } from "@/types"

interface MatchEventsProps {
  selectedMatch: Match
}

export function MatchEvents({ selectedMatch }: MatchEventsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xl font-bold text-yellow-400 mb-4">📋 Match Events Timeline</h4>
      {selectedMatch.events?.map((event, idx) => (
        <div key={idx} className="flex items-center gap-4 bg-slate-700/50 p-3 rounded-lg">
          <span className="text-xl font-bold text-orange-400 w-12">{event.minute}&apos;</span>
          <div className="flex items-center gap-2">
            <img
              src={event.team === "home" ? selectedMatch.homeLogo : selectedMatch.awayLogo}
              alt=""
              className="w-6 h-6"
            />
            {event.type === "goal" && <span className="text-2xl">⚽</span>}
            {event.type === "yellow" && <span className="text-2xl">🟨</span>}
            {event.type === "red" && <span className="text-2xl">🟥</span>}
            {event.type === "substitution" && <span className="text-2xl">🔄</span>}
          </div>
          <div className="flex-1">
            {event.type === "goal" && (
              <>
                <div className="font-semibold">
                  Goal: {event.player}
                  {event.assist && (
                    <span className="text-slate-400 text-sm"> (Assist: {event.assist})</span>
                  )}
                </div>
              </>
            )}
            {event.type === "yellow" && <div className="font-semibold">Yellow Card: {event.player}</div>}
            {event.type === "red" && <div className="font-semibold">Red Card: {event.player}</div>}
            {event.type === "substitution" && (
              <div className="font-semibold">
                Sub: {event.playerIn} ← {event.playerOut}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
