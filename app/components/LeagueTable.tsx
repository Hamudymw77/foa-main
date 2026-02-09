"use client"
import { TeamStanding, FormResult } from "@/types"

interface LeagueTableProps {
  standings: TeamStanding[]
}

export function LeagueTable({ standings }: LeagueTableProps) {
  const getFormColor = (result: FormResult) => {
    if (result === "W" || result === "V") return "bg-green-500"
    if (result === "D" || result === "R") return "bg-yellow-500"
    return "bg-red-500"
  }

  const getRowColor = (pos: number) => {
    if (pos <= 4) return "bg-green-500/10"
    if (pos === 5) return "bg-sky-400/10"
    if (pos >= 18) return "bg-red-500/10"
    return ""
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-700 text-slate-200">
          <tr>
            <th className="p-3 text-left">Pos</th>
            <th className="p-3 text-left">Team</th>
            <th className="p-3 text-center">P</th>
            <th className="p-3 text-center">W</th>
            <th className="p-3 text-center">D</th>
            <th className="p-3 text-center">L</th>
            <th className="p-3 text-center">GD</th>
            <th className="p-3 text-center">GF</th>
            <th className="p-3 text-center">Pts</th>
            <th className="p-3 text-left">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr
              key={team.pos}
              className={`border-b border-slate-700 hover:bg-slate-700/50 ${getRowColor(team.pos)}`}
            >
              <td className="p-3 font-bold">{team.pos}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <img src={team.logo || "/placeholder.svg"} alt={team.team} className="w-6 h-6" />
                  <span className="font-medium">{team.team}</span>
                </div>
              </td>
              <td className="p-3 text-center">{team.played}</td>
              <td className="p-3 text-center">{team.won}</td>
              <td className="p-3 text-center">{team.drawn}</td>
              <td className="p-3 text-center">{team.lost}</td>
              <td className="p-3 text-center font-bold">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              <td className="p-3 text-center">{team.gf}</td>
              <td className="p-3 text-center font-bold text-yellow-400">{team.points}</td>
              <td className="p-3">
                <div className="flex gap-1">
                  {team.form.map((result, i) => (
                    <span
                      key={i}
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${getFormColor(result)}`}
                    >
                      {result}
                    </span>
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
