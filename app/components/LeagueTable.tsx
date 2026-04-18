"use client"
import { TeamStanding, FormResult } from "@/types"
import { TeamLogo } from "./TeamLogo"
import Link from "next/link"

interface LeagueTableProps {
  standings: TeamStanding[]
  lastUpdated?: Date
}

export function LeagueTable({ standings, lastUpdated }: LeagueTableProps) {
  const getFormColor = (result: FormResult) => {
    if (result === "W" || result === "V") return "bg-green-500"
    if (result === "D" || result === "R") return "bg-yellow-500"
    return "bg-red-500"
  }

  const getRowColor = (pos: number) => {
    if (pos <= 5) return "bg-green-500/10"
    if (pos === 6) return "bg-orange-500/10"
    if (pos >= 18) return "bg-red-500/10"
    return ""
  }

  return (
    <div className="overflow-x-auto rounded-lg relative">
      {lastUpdated && (
        <div className="text-xs text-secondary mb-2 text-right">
          Last updated: {lastUpdated.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      <table className="w-full text-sm border-collapse">
        <thead className="bg-white/5 text-secondary font-bold uppercase tracking-wider">
          <tr>
            <th className="p-3 text-left sticky left-0 z-20 bg-background w-12 border-b border-white/10">Pos</th>
            <th className="p-3 text-left sticky left-12 z-20 bg-background shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)] border-r border-b border-white/10">Team</th>
            <th className="p-3 text-center min-w-[40px] border-b border-white/10">P</th>
            <th className="p-3 text-center min-w-[40px] border-b border-white/10">W</th>
            <th className="p-3 text-center min-w-[40px] border-b border-white/10">D</th>
            <th className="p-3 text-center min-w-[40px] border-b border-white/10">L</th>
            <th className="p-3 text-center min-w-[40px] border-b border-white/10">GF</th>
            <th className="p-3 text-center min-w-[40px] border-b border-white/10">GA</th>
            <th className="p-3 text-center min-w-[40px] border-b border-white/10">GD</th>
            <th className="p-3 text-center min-w-[40px] border-b border-white/10">Pts</th>
            <th className="p-3 text-left min-w-[120px] border-b border-white/10">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr
              key={team.pos}
              className={`border-b border-white/10 hover:bg-white/5 transition-colors group ${getRowColor(team.pos)}`}
            >
              <td className={`p-3 font-bold sticky left-0 z-10 w-12 border-b border-white/10 ${getRowColor(team.pos) || 'bg-background'} group-hover:bg-white/10 transition-colors`}>{team.pos}</td>
              <td className={`p-3 sticky left-12 z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.5)] border-r border-b border-white/10 ${getRowColor(team.pos) || 'bg-background'} group-hover:bg-white/10 transition-colors`}>
                <div className="flex items-center gap-2 w-max">
                  <TeamLogo teamName={team.team} url={team.logo} className="w-6 h-6" />
                  <span className="font-medium whitespace-nowrap text-foreground">{team.team}</span>
                </div>
              </td>
              <td className="p-3 text-center">{team.played}</td>
              <td className="p-3 text-center">{team.won}</td>
              <td className="p-3 text-center">{team.drawn}</td>
              <td className="p-3 text-center">{team.lost}</td>
              <td className="p-3 text-center">{team.gf}</td>
              <td className="p-3 text-center">{team.ga}</td>
              <td className="p-3 text-center font-bold">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              <td className="p-3 text-center font-bold text-accent">{team.points}</td>
              <td className="p-3">
                <div className="flex gap-1">
                  {team.form.map((result, i) => (
                    <div key={i} className="relative group/form">
                      {team.formDetails?.[i]?.matchId ? (
                        <Link
                          href={`/match/${team.formDetails[i].matchId}`}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${getFormColor(result)}`}
                          aria-label={`Open match ${team.formDetails[i].homeTeam} vs ${team.formDetails[i].awayTeam}`}
                        >
                          {result}
                        </Link>
                      ) : (
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${getFormColor(result)}`}>
                          {result}
                        </span>
                      )}

                      {team.formDetails?.[i] && (
                        <div className="pointer-events-none absolute left-1/2 top-0 z-30 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-white/15 bg-slate-900 px-2 py-1 text-[11px] text-white shadow-xl group-hover/form:block">
                          {team.formDetails[i].homeScore}:{team.formDetails[i].awayScore} ({team.formDetails[i].homeTeam} - {team.formDetails[i].awayTeam}) {team.formDetails[i].date}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
