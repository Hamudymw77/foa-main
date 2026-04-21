"use client"
import { Match } from "@/types"
import { TeamLogo } from "./TeamLogo"
import Link from "next/link"

interface MatchCardProps {
  match: Match
  selectedMatchId?: string
  homeForm?: string[]
  awayForm?: string[]
}

export function MatchCard({ match, selectedMatchId, homeForm = [], awayForm = [] }: MatchCardProps) {
  const m = match;

  const renderFormDots = (form: string[]) => {
    return (
      <div className="flex gap-1 mt-1">
        {form.map((result, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full ${
              result === 'W' ? 'bg-green-500' : 
              result === 'L' ? 'bg-red-500' : 'bg-slate-400'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <Link
      href={`/match/${m.id}`}
      className={`glass-card rounded-xl p-4 md:p-5 transition-all duration-300 text-left border block hover:scale-[1.02] ${
        selectedMatchId === m.id ? 'border-accent ring-1 ring-accent/50' : 'border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-medium text-secondary">{m.date}</div>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${m.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          {m.status === 'upcoming' ? 'Upcoming' : 'Finished'}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamLogo 
            teamName={m.homeTeam} 
            url={m.homeLogo} 
            className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" 
          />
          <div className="text-center w-full">
            <span className="block text-xs md:text-sm font-bold text-slate-200 leading-tight mb-1 truncate">{m.homeTeam}</span>
            <div className="flex justify-center">{renderFormDots(homeForm)}</div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-w-[72px] md:min-w-[80px] bg-slate-900/50 rounded-lg py-2 px-1">
          <div className={`text-2xl md:text-3xl font-black tracking-tighter ${m.status === 'upcoming' ? 'text-slate-600' : 'text-white'}`}>
            {m.status === 'upcoming' ? (
                <span className="text-xl md:text-2xl text-slate-500 font-bold">VS</span>
            ) : (
                <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl md:text-4xl">{m.homeScore}</span>
                    <span className="text-secondary text-xl md:text-2xl mx-0.5">:</span>
                    <span className="text-3xl md:text-4xl">{m.awayScore}</span>
                </div>
            )}
          </div>
          {m.status !== 'upcoming' && (
            <div className="text-[10px] font-bold text-secondary mt-1 uppercase tracking-wider">Full Time</div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamLogo 
            teamName={m.awayTeam} 
            url={m.awayLogo} 
            className="w-10 h-10 md:w-12 md:h-12 drop-shadow-md" 
          />
          <div className="text-center w-full">
            <span className="block text-xs md:text-sm font-bold text-slate-200 leading-tight mb-1 truncate">{m.awayTeam}</span>
            <div className="flex justify-center">{renderFormDots(awayForm)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {m.stadium}
        </span>
        {typeof m.round === 'number' && (
            <span className="font-medium bg-slate-800 px-2 py-0.5 rounded text-slate-400">R{m.round}</span>
        )}
      </div>
    </Link>
  )
}
