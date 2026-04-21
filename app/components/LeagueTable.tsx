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
    if (pos <= 5) return "bg-blue-500/10"
    if (pos === 6) return "bg-orange-500/10"
    if (pos >= 18) return "bg-red-500/10"
    return ""
  }

  const getPosBadgeStyle = (pos: number) => {
    if (pos <= 5) return "text-blue-300 bg-blue-500/10 border-blue-400/30"
    if (pos === 6) return "text-orange-300 bg-orange-500/10 border-orange-400/30"
    if (pos >= 18) return "text-red-300 bg-red-500/10 border-red-400/30"
    return "text-secondary bg-white/5 border-white/10"
  }

  return (
    <div className="overflow-x-auto md:overflow-x-visible rounded-lg relative">
      {lastUpdated && (
        <div className="text-xs text-secondary mb-2 text-right">
          Last updated: {lastUpdated.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
      <table className="w-full text-sm border-collapse table-auto md:table-fixed">
        <thead className="bg-white/5 text-secondary font-bold uppercase tracking-wider">
          <tr>
            <th className="py-3 px-1.5 md:p-3 text-left w-12 border-b border-white/10">Pos</th>
            <th className="py-3 px-2 md:p-3 text-left min-w-[160px] border-b border-white/10">Team</th>
            <th className="py-3 px-1.5 md:p-3 text-center w-12 border-b border-white/10">P</th>
            <th className="hidden md:table-cell p-3 text-center w-12 border-b border-white/10">W</th>
            <th className="hidden md:table-cell p-3 text-center w-12 border-b border-white/10">D</th>
            <th className="hidden md:table-cell p-3 text-center w-12 border-b border-white/10">L</th>
            <th className="md:hidden py-3 px-1.5 md:p-3 text-center w-16 border-b border-white/10">G</th>
            <th className="hidden md:table-cell p-3 text-center w-12 border-b border-white/10">GF</th>
            <th className="hidden md:table-cell p-3 text-center w-12 border-b border-white/10">GA</th>
            <th className="hidden md:table-cell p-3 text-center w-12 border-b border-white/10">GD</th>
            <th className="py-3 px-1.5 md:p-3 text-center w-14 border-b border-white/10">Pts</th>
            <th className="hidden md:table-cell p-3 text-left w-[180px] border-b border-white/10">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr
              key={team.pos}
              className={`border-b border-white/10 hover:bg-white/5 transition-colors group ${getRowColor(team.pos)}`}
            >
              <td className="py-3 px-1.5 md:p-3 w-12">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border ${getPosBadgeStyle(team.pos)}`}
                >
                  {team.pos}
                </div>
              </td>
              <td className="py-3 px-2 md:p-3 min-w-[160px]">
                <div className="flex items-center gap-2">
                  <TeamLogo teamName={team.team} className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-foreground text-xs md:text-sm whitespace-nowrap">{team.team}</span>
                </div>
              </td>
              <td className="py-3 px-1.5 md:p-3 text-center tabular-nums">{team.played}</td>
              <td className="hidden md:table-cell p-3 text-center tabular-nums">{team.won}</td>
              <td className="hidden md:table-cell p-3 text-center tabular-nums">{team.drawn}</td>
              <td className="hidden md:table-cell p-3 text-center tabular-nums">{team.lost}</td>
              <td className="md:hidden py-3 px-1.5 md:p-3 text-center tabular-nums font-semibold">{team.gf}:{team.ga}</td>
              <td className="hidden md:table-cell p-3 text-center tabular-nums">{team.gf}</td>
              <td className="hidden md:table-cell p-3 text-center tabular-nums">{team.ga}</td>
              <td className="hidden md:table-cell p-3 text-center tabular-nums font-bold">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              <td className="py-3 px-1.5 md:p-3 text-center font-black text-accent tabular-nums">{team.points}</td>
              <td className="hidden md:table-cell p-3">
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
